export type DecisionStatus = "pending" | "approved" | "skipped" | "snoozed";

export interface Citation {
  label: string;
  value: string;
  source: "deal" | "contact" | "note" | "stage";
  recordId: string;
}

export interface LeadPacket {
  dealId: string;
  contactId: string;
  title: string;
  contactName: string;
  company: string | null;
  stageName: string;
  stagePosition: number;
  stageCount: number;
  value: number;
  currency: string;
  expectedCloseDate: string | null;
  dealNotes: string | null;
  lastNoteText: string | null;
  lastNoteAt: string | null;
  updatedAt: string;
  duplicateCompany: boolean;
}

export interface ScoredLead {
  packet: LeadPacket;
  score: number;
  reason: string;
  citations: Citation[];
}

export interface DecisionAnswer {
  text: string;
  matches: ScoredLead[];
}
