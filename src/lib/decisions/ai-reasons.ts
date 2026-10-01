import { generateReply } from "@/lib/ai/generate";
import type { AiConfig } from "@/lib/ai/types";

import type { ScoredLead } from "./types";

/**
 * Replace draft reasons with model wording when every sentence still
 * points at a deal we scored. Citations and scores stay as computed.
 * If the model output is not usable, the drafts are kept.
 */
export function applyReasonJson(raw: string, leads: ScoredLead[]): ScoredLead[] {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return leads;

  let parsed: { items?: { dealId?: string; reason?: string }[] };
  try {
    parsed = JSON.parse(raw.slice(start, end + 1)) as typeof parsed;
  } catch {
    return leads;
  }

  const byId = new Map<string, string>();
  for (const item of parsed.items ?? []) {
    if (!item.dealId || !item.reason?.trim()) continue;
    byId.set(item.dealId, item.reason.trim());
  }

  return leads.map((lead) => {
    const reason = byId.get(lead.packet.dealId);
    return reason ? { ...lead, reason } : lead;
  });
}

export async function polishReasons(
  config: AiConfig,
  leads: ScoredLead[],
): Promise<ScoredLead[]> {
  if (leads.length === 0) return leads;

  const facts = leads.map((lead) => ({
    dealId: lead.packet.dealId,
    contact: lead.packet.contactName,
    company: lead.packet.company,
    title: lead.packet.title,
    citations: lead.citations.map((citation) => ({
      label: citation.label,
      value: citation.value,
    })),
  }));

  const result = await generateReply({
    config,
    systemPrompt: [
      "You write one short reason per sales lead.",
      "Use only the citations given for that deal.",
      "Do not invent calls, emails, or numbers that are not in the citations.",
      'Return JSON only: {"items":[{"dealId":"...","reason":"..."}]}',
    ].join(" "),
    messages: [{ role: "user", content: JSON.stringify(facts) }],
  });

  return applyReasonJson(result.text, leads);
}
