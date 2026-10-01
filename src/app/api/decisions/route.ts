import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { loadAiConfig } from "@/lib/ai/config";
import { polishReasons } from "@/lib/decisions/ai-reasons";
import { buildQueue } from "@/lib/decisions/load";

export async function GET() {
  try {
    const ctx = await requireRole("viewer");
    const built = await buildQueue(ctx.supabase, ctx.accountId);
    const { data: run, error } = await ctx.supabase
      .from("decision_runs")
      .select("id, summary, created_at, decision_items(*)")
      .eq("account_id", ctx.accountId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return Response.json({
        analytics: built.analytics,
        run: null,
        warning: error.message,
      });
    }

    const items = Array.isArray(run?.decision_items) ? run.decision_items : [];
    items.sort((a: { rank: number }, b: { rank: number }) => a.rank - b.rank);
    return Response.json({
      analytics: built.analytics,
      run: run
        ? { id: run.id, summary: run.summary, createdAt: run.created_at, items }
        : null,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST() {
  try {
    const ctx = await requireRole("agent");
    const built = await buildQueue(ctx.supabase, ctx.accountId);
    let leads = built.leads;
    const summary = built.summary;
    try {
      const ai = await loadAiConfig(ctx.supabase, ctx.accountId);
      if (ai) leads = await polishReasons(ai, leads);
    } catch (err) {
      console.error("[decisions] AI wording skipped:", err);
    }
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
      return Response.json(
        { error: error?.message ?? "Could not save the decision run." },
        { status: 500 },
      );
    }

    if (leads.length > 0) {
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
