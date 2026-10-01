import { requireRole, toErrorResponse } from "@/lib/auth/account";

const STATUSES = new Set(["approved", "skipped", "snoozed", "pending"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const ctx = await requireRole("agent");
    const { id } = await context.params;
    const body = (await request.json()) as { status?: string };
    if (!body.status || !STATUSES.has(body.status)) {
      return Response.json({ error: "Choose approve, skip, or snooze." }, { status: 400 });
    }

    const { data, error } = await ctx.supabase
      .from("decision_items")
      .update({
        status: body.status,
        decided_by: ctx.userId,
        decided_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("account_id", ctx.accountId)
      .select("id, status, decided_at")
      .maybeSingle();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!data) return Response.json({ error: "Decision not found." }, { status: 404 });
    return Response.json({ item: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}
