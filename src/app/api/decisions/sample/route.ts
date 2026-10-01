import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { DEMO_KNOWLEDGE, EXTRA_LEADS } from "@/lib/decisions/demo-data";

const STAGES = ["New", "Qualified", "Proposal", "Negotiation"];

const SAMPLE = [
  { name: "Priya Sharma", company: "Northwind", title: "Expansion", value: 18000, stage: 2, daysQuiet: 30, note: "Asked for pricing and a rollout plan.", closeIn: -11 },
  { name: "Rahul Mehta", company: "Contoso", title: "Pilot", value: 4200, stage: 1, daysQuiet: 2, note: "Demo went well. Waiting on their security review.", closeIn: 40 },
  { name: "Aisha Khan", company: "Fabrikam", title: "Renewal", value: 9600, stage: 3, daysQuiet: 21, note: "Budget holder is out until next month.", closeIn: -3 },
  { name: "Luis Ortega", company: "Adventure Works", title: "New logo", value: 1500, stage: 0, daysQuiet: 1, note: null, closeIn: 60 },
  { name: "Mina Patel", company: "Northwind", title: "Support add-on", value: 6400, stage: 2, daysQuiet: 16, note: "Same buying group as the expansion deal.", closeIn: 10 },
  { name: "Chen Wei", company: "Wide World", title: "Enterprise", value: 27000, stage: 2, daysQuiet: 45, note: "Requested a revised quote after the last call.", closeIn: -20 },
  { name: "Sara Novak", company: "Litware", title: "Starter", value: 800, stage: 0, daysQuiet: 4, note: "Asked for a one-page overview.", closeIn: 25 },
  { name: "Omar Haddad", company: "Tailspin", title: "Migration", value: 12500, stage: 1, daysQuiet: 18, note: null, closeIn: 6 },
];

function isoDaysFromNow(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function dateDaysFromNow(days: number): string {
  return isoDaysFromNow(days).slice(0, 10);
}

export async function POST() {
  try {
    const ctx = await requireRole("agent");
    const { data: existing } = await ctx.supabase
      .from("pipelines")
      .select("id, stages:pipeline_stages(id, name, position)")
      .eq("account_id", ctx.accountId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let pipelineId = existing?.id as string | undefined;
    let stages = (Array.isArray(existing?.stages) ? existing.stages : []) as {
      id: string;
      name: string;
      position: number;
    }[];

    if (!pipelineId) {
      const { data: created, error } = await ctx.supabase
        .from("pipelines")
        .insert({ account_id: ctx.accountId, user_id: ctx.userId, name: "Sales" })
        .select("id")
        .single();
      if (error || !created) {
        return Response.json({ error: error?.message ?? "Could not create a pipeline." }, { status: 500 });
      }
      pipelineId = created.id;
      const { data: stageRows, error: stageError } = await ctx.supabase
        .from("pipeline_stages")
        .insert(
          STAGES.map((name, position) => ({
            pipeline_id: pipelineId,
            name,
            position,
          })),
        )
        .select("id, name, position");
      if (stageError || !stageRows) {
        return Response.json({ error: stageError?.message ?? "Could not create stages." }, { status: 500 });
      }
      stages = stageRows;
    }

    if (stages.length === 0) {
      return Response.json({ error: "The pipeline has no stages." }, { status: 400 });
    }

    stages.sort((a, b) => a.position - b.position);

    const leads = [...SAMPLE, ...EXTRA_LEADS];
    let created = 0;
    for (const [index, lead] of leads.entries()) {
      const phone = `+91000000${String(index + 1).padStart(4, "0")}`;
      const { data: existingContact } = await ctx.supabase
        .from("contacts")
        .select("id")
        .eq("account_id", ctx.accountId)
        .eq("phone", phone)
        .maybeSingle();
      if (existingContact) continue;
      const { data: contact, error: contactError } = await ctx.supabase
        .from("contacts")
        .insert({
          account_id: ctx.accountId,
          user_id: ctx.userId,
          name: lead.name,
          company: lead.company,
          phone,
          email: `${lead.name.split(" ")[0].toLowerCase()}@example.com`,
        })
        .select("id")
        .single();
      if (contactError || !contact) {
        return Response.json({ error: contactError?.message ?? "Could not create a contact." }, { status: 500 });
      }

      const stage = stages[Math.min(lead.stage, stages.length - 1)];
      const updatedAt = isoDaysFromNow(-lead.daysQuiet);
      const { data: deal, error: dealError } = await ctx.supabase
        .from("deals")
        .insert({
          account_id: ctx.accountId,
          user_id: ctx.userId,
          pipeline_id: pipelineId,
          stage_id: stage.id,
          contact_id: contact.id,
          title: lead.title,
          value: lead.value,
          currency: "USD",
          status: "open",
          expected_close_date: dateDaysFromNow(lead.closeIn),
          updated_at: updatedAt,
        })
        .select("id")
        .single();
      if (dealError || !deal) {
        return Response.json({ error: dealError?.message ?? "Could not create a deal." }, { status: 500 });
      }

      if (lead.note) {
        const { error: noteError } = await ctx.supabase.from("contact_notes").insert({
          account_id: ctx.accountId,
          user_id: ctx.userId,
          contact_id: contact.id,
          note_text: lead.note,
          created_at: updatedAt,
        });
        if (noteError) {
          return Response.json({ error: noteError.message }, { status: 500 });
        }
      }
      created += 1;
    }

    for (const doc of DEMO_KNOWLEDGE) {
      const { data: existingDoc } = await ctx.supabase
        .from("ai_knowledge_documents")
        .select("id")
        .eq("account_id", ctx.accountId)
        .eq("title", doc.title)
        .maybeSingle();
      if (existingDoc) continue;
      const { data: document, error: docError } = await ctx.supabase
        .from("ai_knowledge_documents")
        .insert({
          account_id: ctx.accountId,
          created_by: ctx.userId,
          title: doc.title,
          content: doc.content,
        })
        .select("id")
        .single();
      if (docError || !document) continue;
      await ctx.supabase.from("ai_knowledge_chunks").insert({
        document_id: document.id,
        account_id: ctx.accountId,
        chunk_index: 0,
        content: `${doc.title}. ${doc.content}`,
      });
    }

    return Response.json({ ok: true, created });
  } catch (err) {
    return toErrorResponse(err);
  }
}
