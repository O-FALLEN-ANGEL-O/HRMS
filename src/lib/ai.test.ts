import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db/client", () => ({ getEnv: async () => ({}) }));

const ai = await import("./ai");

const job = {
  title: "Senior Backend Engineer",
  description: "Own payroll services.",
  requirements:
    "5+ years building backend services in Go, Java or TypeScript\nStrong PostgreSQL and data modelling\nExperience with queues (Kafka, SQS) and distributed systems\nNice to have: payroll or fintech domain experience",
};

describe("resume matching fallback", () => {
  it("ranks a relevant resume above an unrelated one", () => {
    const strong = ai.matchResumeRules(job, "8 years building backend services in Go and TypeScript on PostgreSQL. Moved jobs to Kafka. Payroll SaaS domain.");
    const weak = ai.matchResumeRules(job, "4 years of PHP/Laravel for agency projects. WordPress.");
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.score).toBeGreaterThanOrEqual(80);
    expect(weak.gaps.length).toBeGreaterThan(0);
  });

  it("falls back to rules when no AI binding exists", async () => {
    const r = await ai.matchResume(job, "6 years Go and PostgreSQL, Kafka");
    expect(r.source).toBe("rules");
  });
});

describe("ticket triage fallback", () => {
  it("categorises common tickets", () => {
    expect(ai.triageTicketRules("VPN keeps dropping", "can't work, disconnects every 20 min")).toMatchObject({ category: "IT", priority: "high" });
    expect(ai.triageTicketRules("PF number missing", "My UAN is not on the payslip")).toMatchObject({ category: "Payroll" });
    expect(ai.triageTicketRules("How do I add parents to insurance?", "question")).toMatchObject({ category: "HR", priority: "low" });
  });
});

describe("policy assistant fallback", () => {
  const policies = [
    { title: "Leave policy", body: "Everyone gets 12 days of casual leave. Sick leave is 10 days. Earned leave is 18 days." },
    { title: "Expenses", body: "Internet is reimbursed up to ₹1,000 a month." },
  ];
  it("answers from the most relevant policy", async () => {
    const r = await ai.askAssistant({ question: "How many sick leave days do I get?", history: [], policies, context: "" });
    expect(r.source).toBe("rules");
    expect(r.sources).toEqual(["Leave policy"]);
    expect(r.answer).toContain("10 days");
  });
  it("admits when nothing matches", async () => {
    const r = await ai.askAssistant({ question: "Quantum zebra?", history: [], policies, context: "" });
    expect(r.answer).toMatch(/couldn't find/);
  });
});

describe("payroll checks", () => {
  it("flags negative pay and big swings", () => {
    const f = ai.payrollChecks([
      { name: "A", net: -10, gross: 0, daysPayable: 30, daysInMonth: 30, prevNet: 50_000 },
      { name: "B", net: 70_000, gross: 80_000, daysPayable: 30, daysInMonth: 30, prevNet: 50_000 },
      { name: "C", net: 50_000, gross: 60_000, daysPayable: 30, daysInMonth: 30, prevNet: 50_000 },
    ]);
    expect(f.find((x) => x.employee === "A")?.severity).toBe("error");
    expect(f.find((x) => x.employee === "B")?.severity).toBe("warning");
    expect(f.some((x) => x.employee === "C")).toBe(false);
  });
});
