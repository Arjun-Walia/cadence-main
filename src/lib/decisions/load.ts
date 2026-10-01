import type { SupabaseClient } from "@supabase/supabase-js";

import { queueSummary, rankLeads, pipelineAnalytics, type PipelineAnalytics } from "./score";
import { toPackets, type DealSource, type NoteSource } from "./packets";
import type { ScoredLead } from "./types";

function asOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function buildQueue(
  db: SupabaseClient,
  accountId: string,
  now = new Date(),
): Promise<{
  leads: ScoredLead[];
  book: ScoredLead[];
  summary: string;
  analytics: PipelineAnalytics;
}> {
  const { data: deals, error } = await db
    .from("deals")
    .select(
      "id, title, value, currency, notes, expected_close_date, updated_at, contact_id, contact:contacts(id, name, company), stage:pipeline_stages(name, position)",
    )
    .eq("account_id", accountId)
    .eq("status", "open");

  if (error) throw new Error(error.message);

  const rows = (deals ?? []).map((deal) => {
    const row = deal as unknown as DealSource & {
      contact: DealSource["contact"] | NonNullable<DealSource["contact"]>[];
      stage: DealSource["stage"] | NonNullable<DealSource["stage"]>[];
    };
    return {
      ...row,
      contact: asOne(row.contact),
      stage: asOne(row.stage),
    };
  });

  const contactIds = rows.map((deal) => deal.contact_id);
  let notes: NoteSource[] = [];
  if (contactIds.length > 0) {
    const { data, error: notesError } = await db
      .from("contact_notes")
      .select("contact_id, note_text, created_at")
      .eq("account_id", accountId)
      .in("contact_id", contactIds);
    if (notesError) throw new Error(notesError.message);
    notes = (data ?? []) as NoteSource[];
  }

  const stageCount =
    rows.reduce((max, deal) => Math.max(max, (deal.stage?.position ?? 0) + 1), 1);
  const packets = toPackets(rows, notes, stageCount);
  const book = rankLeads(packets, now, Math.max(packets.length, 1));
  const leads = book.slice(0, 10);
  return {
    leads,
    book,
    summary: queueSummary(leads),
    analytics: pipelineAnalytics(packets, now),
  };
}
