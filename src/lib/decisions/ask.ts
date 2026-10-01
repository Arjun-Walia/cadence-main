import type { DecisionAnswer, ScoredLead } from "./types";

function amountOver(question: string): number | null {
  const match = question.match(
    /(?:over|above|more than|greater than|>)\s*\$?\s*([\d,]+)/i,
  );
  if (!match) return null;
  return Number(match[1].replace(/,/g, ""));
}

function dayWindow(question: string): number | null {
  const match = question.match(/(\d+)\s*days?/i);
  if (!match) return null;
  return Number(match[1]);
}

function wantsQuiet(question: string): boolean {
  return /no note|without a note|no recent note|gone quiet|stale|no update/i.test(
    question,
  );
}

function staleDays(lead: ScoredLead): number {
  const citation = lead.citations.find((item) => item.label.startsWith("Days since"));
  return citation ? Number(citation.value) : 0;
}

/**
 * Answer a question from the scored packets only. The reply lists the
 * deals that matched and the fields used, so it cannot invent a lead.
 */
export function answerQuestion(
  question: string,
  leads: ScoredLead[],
): DecisionAnswer {
  const minimum = amountOver(question);
  const days = dayWindow(question);
  const quiet = wantsQuiet(question);
  const words = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 3 && !["deal", "deals", "lead", "leads", "which", "what", "have", "with", "from", "that", "this", "over", "days", "note"].includes(word));

  const matches = leads.filter((lead) => {
    if (minimum !== null && lead.packet.value < minimum) return false;
    if (quiet && staleDays(lead) < (days ?? 14)) return false;
    if (!quiet && days !== null && staleDays(lead) < days) return false;
    if (minimum === null && !quiet && days === null && words.length > 0) {
      const haystack = [
        lead.packet.contactName,
        lead.packet.company,
        lead.packet.title,
        lead.packet.stageName,
        lead.packet.lastNoteText,
        lead.packet.dealNotes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return words.every((word) => haystack.includes(word));
    }
    return minimum !== null || quiet || days !== null;
  });

  if (matches.length === 0) {
    return {
      text: "No open deals in this list match that question. The answer only uses deals already loaded.",
      matches: [],
    };
  }

  const lines = matches.slice(0, 8).map((lead) => {
    const value = lead.citations.find((item) => item.label === "Deal value")?.value;
    const quietFor = staleDays(lead);
    return `${lead.packet.contactName} — ${lead.packet.title} (${value}, ${lead.packet.stageName}, ${quietFor} days since the last update)`;
  });

  return {
    text: `${matches.length} deal${matches.length === 1 ? "" : "s"} match. ${lines.join(". ")}.`,
    matches,
  };
}
