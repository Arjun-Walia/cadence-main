"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Citation, DecisionStatus, LeadPacket } from "@/lib/decisions/types";
import { automationCatalog } from "@/lib/decisions/automations";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DecisionItem {
  id: string;
  rank: number;
  score: number;
  reason: string;
  citations: Citation[];
  snapshot: LeadPacket;
  status: DecisionStatus;
}

interface DecisionRun {
  id: string;
  summary: string;
  createdAt: string;
  items: DecisionItem[];
}

interface Analytics {
  openDeals: number;
  pipelineValue: number;
  currency: string;
  staleDeals: number;
  duplicateDeals: number;
  missingNotes: number;
}

const EMPTY_ANALYTICS: Analytics = {
  openDeals: 0,
  pipelineValue: 0,
  currency: "USD",
  staleDeals: 0,
  duplicateDeals: 0,
  missingNotes: 0,
};

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}

function money(currency: string, value: number) {
  return `${currency} ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const AUTOMATIONS = automationCatalog();

export default function DecisionsPage() {
  const [run, setRun] = useState<DecisionRun | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [question, setQuestion] = useState(
    "Which open deals over $5,000 have had no note in 14 days?",
  );
  const [answer, setAnswer] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const body = await readJson<{ run?: DecisionRun; analytics?: Analytics }>(
        await fetch("/api/decisions"),
      );
      setRun(body.run ?? null);
      setAnalytics(body.analytics ?? EMPTY_ANALYTICS);
      setSelectedId(body.run?.items[0]?.id ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load decisions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function buildList() {
    setBusy(true);
    setAnswer(null);
    try {
      const body = await readJson<{ run?: DecisionRun; analytics?: Analytics }>(
        await fetch("/api/decisions", { method: "POST" }),
      );
      setRun(body.run ?? null);
      setAnalytics(body.analytics ?? EMPTY_ANALYTICS);
      setSelectedId(body.run?.items[0]?.id ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rank deals");
    } finally {
      setBusy(false);
    }
  }

  async function loadSample() {
    setBusy(true);
    try {
      const response = await fetch("/api/decisions/sample", { method: "POST" });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not load sample deals");
      await buildList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load sample deals");
      setBusy(false);
    }
  }

  async function decide(id: string, status: DecisionStatus) {
    const previous = run;
    setRun((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) => (item.id === id ? { ...item, status } : item)),
          }
        : current,
    );
    if (id.startsWith("preview-")) {
      toast.message(
        "This list is a preview. Run supabase/migrations/044_decision_items.sql in the Supabase SQL editor so Approve can be saved.",
      );
      setRun(previous);
      return;
    }
    try {
      const response = await fetch(`/api/decisions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Could not save the decision");
    } catch (err) {
      setRun(previous);
      toast.error(err instanceof Error ? err.message : "Could not save the decision");
    }
  }

  async function runAutomation(id: string) {
    setBusy(true);
    try {
      const body = await readJson<{
        run?: DecisionRun | null;
        analytics?: Analytics;
        message?: string;
        warning?: string;
      }>(
        await fetch("/api/decisions/automations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }),
      );
      if (body.analytics) setAnalytics(body.analytics);
      if (body.run) {
        setRun(body.run);
        setSelectedId(body.run.items[0]?.id ?? null);
      }
      if (body.message) toast.message(body.message);
      if (body.warning) toast.message(body.warning);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not run the automation");
    } finally {
      setBusy(false);
    }
  }

  async function ask() {
    setBusy(true);
    try {
      const body = await readJson<{ text: string }>(
        await fetch("/api/decisions/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        }),
      );
      setAnswer(body.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not answer");
    } finally {
      setBusy(false);
    }
  }

  const selected = run?.items.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Sales CRM</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Contacts and deals live in the pipeline. This page reads them, shows what is stale or
            duplicated, and ranks who to contact first. Every reason cites those records. You approve
            before anything is treated as a decision.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={busy} onClick={() => void loadSample()}>
            Load sample deals
          </Button>
          <Button disabled={busy} onClick={() => void buildList()}>
            {busy ? "Ranking…" : "Rank open deals"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Open deals", String(analytics.openDeals)],
          ["Pipeline value", money(analytics.currency, analytics.pipelineValue)],
          ["Quiet 14+ days", String(analytics.staleDeals)],
          ["Needs cleanup", String(analytics.duplicateDeals + analytics.missingNotes)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Needs cleanup counts duplicate companies and deals with no note.{" "}
        <Link href="/pipelines" className="underline">
          Open the pipeline
        </Link>
        {" · "}
        <Link href="/contacts" className="underline">
          Open contacts
        </Link>
        {" · "}
        <Link href="/agents" className="underline">
          AI setup
        </Link>
      </p>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">AI automations</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Each one reads the open deals, writes a reason from those records, and leaves the result pending.
          Approving records your choice. Nobody is contacted.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {AUTOMATIONS.map((automation) => (
            <div key={automation.id} className="rounded-lg border border-border px-3 py-3">
              <p className="text-sm font-medium">{automation.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{automation.description}</p>
              <Button
                className="mt-3"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => void runAutomation(automation.id)}
              >
                Run
              </Button>
            </div>
          ))}
        </div>
      </section>

      <form
        className="rounded-xl border border-border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void ask();
        }}
      >
        <label className="text-sm font-medium" htmlFor="decision-question">
          Ask your CRM
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Answers come from open deals and any documents in the knowledge base. They name the record they used.
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="decision-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Which deals over $5,000 have gone quiet?"
            className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <Button type="submit" variant="outline" disabled={busy || !question.trim()}>
            Answer from the records
          </Button>
        </div>
        {answer && <p className="mt-3 text-sm">{answer}</p>}
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading the latest list…</p>
      ) : !run || run.items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {run?.summary ??
            "No ranked list yet. Load the sample sales list, or add open deals on the pipeline, then rank them."}
        </div>
      ) : (
        <>
          <p className="text-sm text-foreground">{run.summary}</p>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <ol className="space-y-2">
              {run.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left ${
                      item.id === selectedId ? "border-foreground bg-card" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">
                        {item.rank}. {item.snapshot.contactName}
                        <span className="font-normal text-muted-foreground"> — {item.snapshot.title}</span>
                      </p>
                      <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                        {item.status} · {Math.round(item.score)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.reason}</p>
                  </button>
                </li>
              ))}
            </ol>

            {selected && (
              <aside className="h-fit rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">{selected.snapshot.contactName}</p>
                <p className="text-xs text-muted-foreground">{selected.snapshot.company}</p>
                <p className="mt-3 text-sm">{selected.reason}</p>
                <ul className="mt-4 space-y-2">
                  {selected.citations.map((citation) => (
                    <li key={`${citation.label}-${citation.value}`} className="text-xs">
                      <span className="text-muted-foreground">{citation.label}: </span>
                      {citation.value}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs">
                  <Link href={`/contacts?id=${selected.snapshot.contactId}`} className="underline">
                    Open this contact
                  </Link>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void decide(selected.id, "approved")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void decide(selected.id, "snoozed")}>
                    Snooze
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void decide(selected.id, "skipped")}>
                    Skip
                  </Button>
                </div>
              </aside>
            )}
          </div>
        </>
      )}
    </div>
  );
}
