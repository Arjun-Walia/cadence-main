import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { loadAiConfig } from "@/lib/ai/config";
import { polishReasons } from "@/lib/decisions/ai-reasons";
import { DECISION_AUTOMATIONS, runAutomation } from "@/lib/decisions/automations";
import { buildQueue } from "@/lib/decisions/load";

export async function GET() {
  return Response.json({
    automations: DECISION_AUTOMATIONS.map(({ id, name, description }) => ({
      id,
      name,
      description,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const ctx = await requireRole("agent");
    const body = (await request.json()) as { id?: string };
    const automation = DECISION_AUTOMATIONS.find((item) => item.id === body.id);
    if (!automation) {
      return Response.json({ error: "Unknown automation." }, { status: 400 });
    }

    const built = await buildQueue(ctx.supabase, ctx.accountId);
    let leads = runAutomation(automation.id, built.book);
    if (leads.length === 0) {
      return Response.json({
        analytics: built.analytics,
        run: null,
        message: `${automation.name} found no open deals. Add deals on the pipeline, or load the sample list.`,
      });
    }

    try {
      const ai = await loadAiConfig(ctx.supabase, ctx.accountId);
      if (ai) leads = await polishReasons(ai, leads);
    } catch (err) {
      console.error("[decisions] automation wording skipped:", err);
    }

    const summary = `${automation.name}: ${leads.length} deal${leads.length === 1 ? "" : "s"} waiting for approval. Nothing is sent until you approve.`;
    const { data: run, error } = await ctx.supabase
      .from("decision_runs")
      .insert({
        account_id: ctx.accountId,
        created_by: ctx.userId,
        summary,
      })
      .select("id, summary, created_at")
      .single();

    if (error || !run) {
      const missingTable = /decision_runs|schema cache/i.test(error?.message ?? "");
      if (!missingTable) {
        return Response.json(
          { error: error?.message ?? "Could not save this automation run." },
          { status: 500 },
        );
      }
      return Response.json({
        analytics: built.analytics,
        warning:
          "This list is a preview. Run supabase/migrations/044_decision_items.sql in the Supabase SQL editor so Approve can be saved.",
        run: {
          id: "preview",
          summary,
          createdAt: new Date().toISOString(),
          items: leads.map((lead, index) => ({
            id: `preview-${index + 1}`,
            rank: index + 1,
            score: lead.score,
            reason: lead.reason,
            citations: lead.citations,
            snapshot: lead.packet,
            status: "pending",
          })),
        },
      });
    }

    const { error: itemsError } = await ctx.supabase.from("decision_items").insert(
      leads.map((lead, index) => ({
        run_id: run.id,
        account_id: ctx.accountId,
        deal_id: lead.packet.dealId,
        contact_id: lead.packet.contactId,
        rank: index + 1,
        score: lead.score,
        reason: lead.reason,
        citations: lead.citations,
        snapshot: lead.packet,
        status: "pending",
      })),
    );
    if (itemsError) {
      return Response.json({ error: itemsError.message }, { status: 500 });
    }

    const { data: items } = await ctx.supabase
      .from("decision_items")
      .select("*")
      .eq("run_id", run.id)
      .order("rank", { ascending: true });

    return Response.json({
      analytics: built.analytics,
      run: {
        id: run.id,
        summary: run.summary,
        createdAt: run.created_at,
        items: items ?? [],
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
