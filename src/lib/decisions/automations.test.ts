import { describe, expect, it } from "vitest";
import { runAutomation } from "./automations";
import { scoreLead } from "./score";
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

describe("runAutomation", () => {
  const leads = [
    scoreLead(packet(), NOW),
    scoreLead(
      packet({
        dealId: "small",
        contactId: "contact-2",
        contactName: "Sara",
        title: "Starter",
        value: 800,
        lastNoteAt: "2026-09-28T00:00:00.000Z",
        updatedAt: "2026-09-28T00:00:00.000Z",
        expectedCloseDate: "2026-12-01",
      }),
      NOW,
    ),
    scoreLead(
      packet({
        dealId: "twin",
        contactId: "contact-3",
        contactName: "Mina",
        company: "Northwind",
        duplicateCompany: true,
        value: 6400,
      }),
      NOW,
    ),
  ];

  it("keeps only quiet deals worth at least $5,000", () => {
    const picked = runAutomation("quiet-high-value", leads, NOW);
    expect(picked.map((lead) => lead.packet.dealId)).toEqual(["deal-1", "twin"]);
  });

  it("keeps only duplicate companies", () => {
    const picked = runAutomation("duplicate-company", leads, NOW);
    expect(picked.map((lead) => lead.packet.dealId)).toEqual(["twin"]);
  });
});
