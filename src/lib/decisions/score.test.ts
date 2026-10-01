import { describe, expect, it } from "vitest";
import { answerQuestion } from "./ask";
import { pipelineAnalytics, rankLeads, scoreLead } from "./score";
import type { LeadPacket } from "./types";

const NOW = new Date("2026-10-01T00:00:00.000Z");

function packet(overrides: Partial<LeadPacket> = {}): LeadPacket {
  return {
    dealId: "deal-1",
    contactId: "contact-1",
    title: "Expansion",
    contactName: "Priya Sharma",
    company: "Northwind",
    stageName: "Proposal",
    stagePosition: 2,
    stageCount: 4,
    value: 18000,
    currency: "USD",
    expectedCloseDate: "2026-09-20",
    dealNotes: null,
    lastNoteText: "Asked for pricing",
    lastNoteAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    duplicateCompany: false,
    ...overrides,
  };
}

describe("scoreLead", () => {
  it("ranks a stale high-value deal above a fresh small one", () => {
    const ranked = rankLeads(
      [
        packet({ dealId: "small", value: 500, lastNoteAt: "2026-09-30T00:00:00.000Z", expectedCloseDate: "2026-12-01" }),
        packet(),
      ],
      NOW,
    );
    expect(ranked[0]?.packet.dealId).toBe("deal-1");
    expect(ranked[0]?.citations.map((item) => item.label)).toContain("Deal value");
    expect(ranked[0]?.reason).toContain("18,000");
    expect(ranked[0]?.reason).toContain("Asked for pricing");
  });

  it("cites a missing note instead of inventing one", () => {
    const scored = scoreLead(
      packet({ lastNoteText: null, lastNoteAt: null, dealNotes: null }),
      NOW,
    );
    expect(scored.reason).toContain("no note");
  });
});

describe("pipelineAnalytics", () => {
  it("counts stale, duplicate, and note-less deals across the whole pipeline", () => {
    const stats = pipelineAnalytics(
      [
        packet(),
        packet({
          dealId: "twin",
          contactId: "contact-2",
          company: "Northwind",
          duplicateCompany: true,
          lastNoteText: null,
          lastNoteAt: null,
          dealNotes: null,
          value: 1000,
        }),
      ],
      NOW,
    );
    expect(stats.openDeals).toBe(2);
    expect(stats.pipelineValue).toBe(19000);
    expect(stats.staleDeals).toBeGreaterThan(0);
    expect(stats.duplicateDeals).toBe(1);
    expect(stats.missingNotes).toBe(1);
  });
});

describe("answerQuestion", () => {
  it("returns only deals over the stated value that have gone quiet", () => {
    const ranked = rankLeads(
      [
        packet({ dealId: "big", value: 8000, lastNoteAt: "2026-09-01T00:00:00.000Z" }),
        packet({ dealId: "small", value: 1000, contactName: "Rahul", title: "Pilot", lastNoteAt: "2026-09-01T00:00:00.000Z" }),
      ],
      NOW,
      10,
    );
    const answer = answerQuestion(
      "Which open deals over $5,000 have had no note in 14 days?",
      ranked,
    );
    expect(answer.matches.map((lead) => lead.packet.dealId)).toEqual(["big"]);
    expect(answer.text).toContain("Priya Sharma");
    expect(answer.text).not.toContain("Rahul");
  });
});
