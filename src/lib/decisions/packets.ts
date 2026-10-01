import type { LeadPacket } from "./types";

export interface DealSource {
  id: string;
  title: string;
  value: number | string | null;
  currency: string | null;
  notes: string | null;
  expected_close_date: string | null;
  updated_at: string;
  contact_id: string;
  contact: {
    id: string;
    name: string | null;
    company: string | null;
  } | null;
  stage: {
    name: string;
    position: number;
  } | null;
}

export interface NoteSource {
  contact_id: string;
  note_text: string;
  created_at: string;
}

export function toPackets(
  deals: DealSource[],
  notes: NoteSource[],
  stageCount: number,
): LeadPacket[] {
  const latestNote = new Map<string, NoteSource>();
  for (const note of notes) {
    const current = latestNote.get(note.contact_id);
    if (!current || note.created_at > current.created_at) {
      latestNote.set(note.contact_id, note);
    }
  }

  const companyCounts = new Map<string, number>();
  for (const deal of deals) {
    const company = deal.contact?.company?.trim().toLowerCase();
    if (!company) continue;
    companyCounts.set(company, (companyCounts.get(company) ?? 0) + 1);
  }

  return deals.map((deal) => {
    const note = latestNote.get(deal.contact_id);
    const company = deal.contact?.company?.trim() || null;
    const companyKey = company?.toLowerCase() ?? "";
    return {
      dealId: deal.id,
      contactId: deal.contact_id,
      title: deal.title,
      contactName: deal.contact?.name?.trim() || "Unnamed contact",
      company,
      stageName: deal.stage?.name ?? "Unknown stage",
      stagePosition: deal.stage?.position ?? 0,
      stageCount: Math.max(stageCount, 1),
      value: Number(deal.value ?? 0),
      currency: deal.currency || "USD",
      expectedCloseDate: deal.expected_close_date,
      dealNotes: deal.notes,
      lastNoteText: note?.note_text ?? null,
      lastNoteAt: note?.created_at ?? null,
      updatedAt: deal.updated_at,
      duplicateCompany: companyKey ? (companyCounts.get(companyKey) ?? 0) > 1 : false,
    };
  });
}
