export const DEMO_KNOWLEDGE = [
  {
    title: "Who to contact first",
    content:
      "Contact the highest-value open deal that has gone 14 days or more without an update before smaller fresh deals. Every recommendation must name the deal value, the stage, and the last note. A person must approve before anyone is contacted. Do not send a message automatically.",
  },
  {
    title: "Duplicate companies",
    content:
      "If two open deals share a company, treat them as one buying group. Contact the larger deal first and mention the smaller one in the same conversation. Northwind is a shared buying group when both the expansion and the support add-on are open.",
  },
  {
    title: "Pricing bands",
    content:
      "Deals under 5000 USD are starter or pilot work. Deals from 5000 to 15000 USD are standard. Deals over 15000 USD are enterprise. Enterprise deals that have been quiet for 14 days need a person to approve outreach.",
  },
];

export const EXTRA_LEADS = [
  {
    name: "Neha Kapoor",
    company: "Alpine Retail",
    title: "Q4 order",
    value: 22000,
    stage: 2,
    daysQuiet: 28,
    note: "Imported from the Q4 spreadsheet. Asked for a revised quote.",
    closeIn: -8,
  },
  {
    name: "Tom Becker",
    company: "Northwind",
    title: "Training seats",
    value: 3100,
    stage: 1,
    daysQuiet: 9,
    note: "Wants training only if the expansion deal moves forward.",
    closeIn: 20,
  },
  {
    name: "Elena Rossi",
    company: "Brightpath",
    title: "Analytics rollout",
    value: 15400,
    stage: 3,
    daysQuiet: 19,
    note: "Close date slipped. Still waiting on procurement.",
    closeIn: -5,
  },
  {
    name: "Jon Park",
    company: "Brightpath",
    title: "Seat expansion",
    value: 4800,
    stage: 0,
    daysQuiet: 3,
    note: null,
    closeIn: 30,
  },
];
