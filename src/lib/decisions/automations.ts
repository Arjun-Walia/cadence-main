import { scoreLead } from "./score";
import type { LeadPacket, ScoredLead } from "./types";

export interface DecisionAutomation {
  id: string;
  name: string;
  description: string;
  match: (packet: LeadPacket, now: Date) => boolean;
}

function quietDays(packet: LeadPacket, now: Date): number {
  const from = packet.lastNoteAt ?? packet.updatedAt;
  const then = new Date(from).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now.getTime() - then) / 86_400_000));
}

/** Rules a sales team would otherwise apply by hand. None of them contact anyone. */
export const DECISION_AUTOMATIONS: DecisionAutomation[] = [
  {
    id: "quiet-high-value",
    name: "Quiet high-value deals",
    description:
      "Finds open deals worth at least $5,000 that have gone 14 days without an update. The reason cites the deal. A person still has to approve.",
    match: (packet, now) => packet.value >= 5000 && quietDays(packet, now) >= 14,
  },
  {
    id: "duplicate-company",
    name: "Same company, two open deals",
    description:
      "Finds companies with more than one open deal so the team talks to that buyer once, starting with the larger deal.",
    match: (packet) => packet.duplicateCompany,
  },
  {
    id: "past-close",
    name: "Past the expected close date",
    description:
      "Finds open deals whose close date has already passed and still need a human decision.",
    match: (packet, now) => {
      const close = packet.expectedCloseDate;
      if (!close) return false;
      return close < now.toISOString().slice(0, 10);
    },
  },
  {
    id: "missing-note",
    name: "No note on the deal",
    description:
      "Finds open deals with no note, so the next action is not based on a guess.",
    match: (packet) => !packet.lastNoteText && !packet.dealNotes,
  },
];

export function automationCatalog() {
  return DECISION_AUTOMATIONS.map(({ id, name, description }) => ({
    id,
    name,
    description,
  }));
}

export function runAutomation(
  id: string,
  leads: ScoredLead[],
  now = new Date(),
): ScoredLead[] {
  const automation = DECISION_AUTOMATIONS.find((item) => item.id === id);
  if (!automation) return [];
  return leads
    .filter((lead) => automation.match(lead.packet, now))
    .map((lead) => scoreLead(lead.packet, now))
    .sort((a, b) => b.score - a.score || b.packet.value - a.packet.value);
}
