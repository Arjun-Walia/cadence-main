import { requireRole, toErrorResponse } from "@/lib/auth/account";
import { loadAiConfig } from "@/lib/ai/config";
import { generateReply } from "@/lib/ai/generate";
import { retrieveKnowledge } from "@/lib/ai/knowledge";
import { answerQuestion } from "@/lib/decisions/ask";
import { buildQueue } from "@/lib/decisions/load";

export async function POST(request: Request) {
  try {
    const ctx = await requireRole("viewer");
    const body = (await request.json()) as { question?: string };
    const question = body.question?.trim();
    if (!question) {
      return Response.json({ error: "Ask a question about your deals." }, { status: 400 });
    }

    const { leads } = await buildQueue(ctx.supabase, ctx.accountId);
    const grounded = answerQuestion(question, leads);
    const dealFacts = grounded.matches.slice(0, 8).map((lead) => ({
      contact: lead.packet.contactName,
      title: lead.packet.title,
      citations: lead.citations.map((citation) => `${citation.label}: ${citation.value}`),
    }));

    let documents: string[] = [];
    let ai: Awaited<ReturnType<typeof loadAiConfig>> = null;
    try {
      ai = await loadAiConfig(ctx.supabase, ctx.accountId, { requireActive: false });
    } catch (err) {
      console.error("[decisions] AI config skipped:", err);
    }
    try {
      documents = await retrieveKnowledge(
        ctx.supabase,
        ctx.accountId,
        { embeddingsApiKey: ai?.embeddingsApiKey ?? null },
        question,
        3,
      );
    } catch (err) {
      console.error("[decisions] knowledge lookup skipped:", err);
    }

    if (ai?.isActive) {
      try {
        const result = await generateReply({
          config: ai,
          systemPrompt: [
            "Answer the sales question using only the deals and document excerpts provided.",
            "Name the contact and the field you used.",
            "If the records do not contain the answer, say so.",
            "Do not tell the team to contact anyone until a person approves.",
          ].join(" "),
          messages: [
            {
              role: "user",
              content: JSON.stringify({ question, deals: dealFacts, documents }),
            },
          ],
        });
        if (result.text) {
          return Response.json({
            text: result.text,
            dealCount: grounded.matches.length,
            documentCount: documents.length,
          });
        }
      } catch (err) {
        console.error("[decisions] answer model skipped:", err);
      }
    }

    const fromDocs = documents.length
      ? ` From your documents: ${documents[0].slice(0, 280)}`
      : "";
    return Response.json({
      text: `${grounded.text}${fromDocs}`,
      dealCount: grounded.matches.length,
      documentCount: documents.length,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
