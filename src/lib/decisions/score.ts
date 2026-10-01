import type { Citation, LeadPacket, ScoredLead } from "./types";

const DAY_MS = 86_400_000;

/** Whole days from `iso` until `now`. Negative when `iso` is still in the future. */
export function dayDiff(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return null;
  return Math.floor((now.getTime() - time) / DAY_MS);
}

function money(packet: LeadPacket): string {
  const amount = packet.value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return `${packet.currency} ${amount}`;
}

/**
 * Rank an open deal from fields that already exist on the record.
 * The score is computed here, not by the model, so the order stays
 * explainable when the provider is slow or unconfigured.
 */
export function scoreLead(packet: LeadPacket, now = new Date()): ScoredLead {
  const citations: Citation[] = [];
  let score = 0;

  const valuePoints = Math.min(40, Math.round(packet.value / 500));
  score += valuePoints;
  citations.push({
    label: "Deal value",
    value: money(packet),
    source: "deal",
    recordId: packet.dealId,
  });

  const span = Math.max(packet.stageCount - 1, 1);
  score += Math.round((packet.stagePosition / span) * 20);
  citations.push({
    label: "Stage",
    value: packet.stageName,
    source: "stage",
    recordId: packet.dealId,
  });

  const activityAt = packet.lastNoteAt ?? packet.updatedAt;
  const staleDays = dayDiff(activityAt, now) ?? 0;
  if (staleDays >= 30) score += 25;
  else if (staleDays >= 14) score += 20;
  else if (staleDays >= 7) score += 10;
  citations.push({
    label: packet.lastNoteAt ? "Days since last note" : "Days since deal update",
    value: String(Math.max(0, staleDays)),
    source: packet.lastNoteAt ? "note" : "deal",
    recordId: packet.dealId,
  });

  const closeIn = packet.expectedCloseDate
    ? dayDiff(packet.expectedCloseDate, now)
    : null;
  if (closeIn !== null && closeIn >= -14) {
    score += 15;
    citations.push({
      label: closeIn > 0 ? "Close date passed" : "Close date",
      value: packet.expectedCloseDate ?? "",
      source: "deal",
      recordId: packet.dealId,
    });
  }

  if (packet.duplicateCompany && packet.company) {
    score += 5;
    citations.push({
      label: "Duplicate company",
      value: packet.company,
      source: "contact",
      recordId: packet.contactId,
    });
  }

  return {
    packet,
    score,
    reason: explainLead(packet, staleDays, closeIn),
    citations,
  };
}

export function explainLead(
  packet: LeadPacket,
  staleDays: number,
  closeIn: number | null,
): string {
  const who = packet.contactName || packet.title;
  const quiet =
    staleDays >= 7
      ? `No update for ${Math.max(0, staleDays)} days.`
      : "Touched in the last week.";
  const note = packet.lastNoteText
    ? ` Last note: “${packet.lastNoteText.slice(0, 140)}”.`
    : packet.dealNotes
      ? ` Deal note: “${packet.dealNotes.slice(0, 140)}”.`
      : " There is no note on this lead.";
  const close =
    closeIn === null
      ? ""
      : closeIn > 0
        ? ` Expected close ${packet.expectedCloseDate} has passed.`
        : ` Expected close is ${packet.expectedCloseDate}.`;
  const duplicate = packet.duplicateCompany
    ? ` Another open deal shares the company ${packet.company}.`
    : "";
  return `${who} — ${packet.title}, ${money(packet)}, stage ${packet.stageName}. ${quiet}${note}${close}${duplicate}`;
}

export function rankLeads(
  packets: LeadPacket[],
  now = new Date(),
  limit = 10,
): ScoredLead[] {
  return packets
    .map((packet) => scoreLead(packet, now))
    .sort((a, b) => b.score - a.score || b.packet.value - a.packet.value)
    .slice(0, limit);
}

export interface PipelineAnalytics {
  openDeals: number;
  pipelineValue: number;
  currency: string;
  staleDeals: number;
  duplicateDeals: number;
  missingNotes: number;
}

/** Counts the problems the team would otherwise find by hand. */
export function pipelineAnalytics(
  packets: LeadPacket[],
  now = new Date(),
): PipelineAnalytics {
  let pipelineValue = 0;
  let staleDeals = 0;
  let duplicateDeals = 0;
  let missingNotes = 0;
  for (const packet of packets) {
    pipelineValue += packet.value;
    const age = dayDiff(packet.lastNoteAt ?? packet.updatedAt, now) ?? 0;
    if (age >= 14) staleDeals += 1;
    if (packet.duplicateCompany) duplicateDeals += 1;
    if (!packet.lastNoteText && !packet.dealNotes) missingNotes += 1;
  }
  return {
    openDeals: packets.length,
    pipelineValue,
    currency: packets[0]?.currency ?? "USD",
    staleDeals,
    duplicateDeals,
    missingNotes,
  };
}

export function queueSummary(leads: ScoredLead[]): string {
  if (leads.length === 0) {
    return "No open deals to rank. Add deals on the pipeline, or load a sample list.";
  }
  const quiet = leads.filter((lead) =>
    lead.citations.some(
      (citation) =>
        citation.label.startsWith("Days since") && Number(citation.value) >= 14,
    ),
  ).length;
  return `${leads.length} leads to review. ${quiet} of them have gone 14 days or more without an update. Nothing is sent until you approve.`;
}
