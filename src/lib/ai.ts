import "server-only";
import { getEnv } from "@/db/client";

/**
 * Workers AI helpers. Every function has a deterministic fallback so the app
 * keeps working when the AI binding is unavailable (local dev without a
 * Cloudflare login, quota exhausted, or a malformed model response).
 * Results report `source` so the UI can say which one produced them.
 */

export const AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export type AiSource = "ai" | "rules";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function runJson<T>(messages: Msg[], schema: object): Promise<T | null> {
  try {
    const env = await getEnv();
    if (!env.AI) return null;
    const res = (await (env.AI as unknown as { run: (m: string, i: unknown) => Promise<unknown> }).run(AI_MODEL, {
      messages,
      response_format: { type: "json_schema", json_schema: schema },
      max_tokens: 900,
      temperature: 0.2,
    })) as { response?: unknown };
    const raw = res?.response;
    if (raw && typeof raw === "object") return raw as T;
    if (typeof raw === "string") {
      const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    return null;
  } catch (err) {
    console.warn("[ai] falling back to rules:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function runText(messages: Msg[]): Promise<string | null> {
  try {
    const env = await getEnv();
    if (!env.AI) return null;
    const res = (await (env.AI as unknown as { run: (m: string, i: unknown) => Promise<unknown> }).run(AI_MODEL, {
      messages,
      max_tokens: 700,
      temperature: 0.3,
    })) as { response?: unknown };
    return typeof res?.response === "string" && res.response.trim() ? res.response.trim() : null;
  } catch (err) {
    console.warn("[ai] falling back to rules:", err instanceof Error ? err.message : err);
    return null;
  }
}

/* ---------------- Text utilities for the fallbacks ---------------- */

const STOP = new Set(
  "a an and are as at be by for from has have in is it its of on or our the their to with you your we will this that years year experience strong plus nice comfortable good".split(
    " ",
  ),
);

export function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s/-]/g, " ")
    .split(/[\s/]+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t));
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/* ---------------- Resume matching ---------------- */

export interface ResumeMatch {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  questions: string[];
  source: AiSource;
}

export function matchResumeRules(job: { title: string; requirements: string }, resume: string): ResumeMatch {
  const reqLines = job.requirements.split("\n").map((l) => l.trim()).filter(Boolean);
  const resumeTokens = new Set(tokens(resume));
  const yearsInResume = Math.max(0, ...[...resume.matchAll(/(\d+)\+?\s*years?/gi)].map((m) => Number(m[1])));
  const met: string[] = [];
  const missing: string[] = [];
  for (const line of reqLines) {
    const lt = tokens(line);
    const yearsNeeded = Number(line.match(/(\d+)\+?\s*years?/i)?.[1] ?? 0);
    const overlap = lt.filter((t) => resumeTokens.has(t)).length / Math.max(1, lt.length);
    const yearsOk = !yearsNeeded || yearsInResume >= yearsNeeded;
    const optional = /^nice to have|a plus/i.test(line);
    if (overlap >= 0.2 && yearsOk) met.push(line);
    else if (!optional) missing.push(line);
  }
  const required = reqLines.filter((l) => !/^nice to have|a plus/i.test(l)).length || 1;
  const metRequired = met.filter((l) => !/^nice to have|a plus/i.test(l)).length;
  const score = clamp(Math.round(25 + (metRequired / required) * 65 + (met.length - metRequired) * 5), 5, 97);
  return {
    score,
    summary:
      score >= 80
        ? `Meets most of the ${job.title} requirements based on the resume text.`
        : score >= 55
          ? `Meets some requirements; ${missing.length} need checking in an interview.`
          : `Few of the ${job.title} requirements show up in this resume.`,
    strengths: met.slice(0, 4),
    gaps: missing.slice(0, 4),
    questions: [
      ...missing.slice(0, 2).map((m) => `Tell me about your experience with: ${m.replace(/\.$/, "")}?`),
      "Describe a project you owned end to end and what you'd do differently.",
    ],
    source: "rules",
  };
}

export async function matchResume(job: { title: string; description: string; requirements: string }, resume: string): Promise<ResumeMatch> {
  const ai = await runJson<Omit<ResumeMatch, "source">>(
    [
      {
        role: "system",
        content:
          "You screen resumes for an HR team. Judge only job-relevant skills and experience in the text. Ignore name, gender, age, religion, caste, college prestige and anything not job-related. Be concise and specific.",
      },
      {
        role: "user",
        content: `Job: ${job.title}\n${job.description}\nRequirements:\n${job.requirements}\n\nResume:\n${resume.slice(0, 6000)}\n\nReturn JSON with score (0-100 fit), summary (one sentence), strengths (up to 4 short items tied to requirements), gaps (up to 4), questions (3 interview questions that probe the gaps).`,
      },
    ],
    {
      type: "object",
      properties: {
        score: { type: "number" },
        summary: { type: "string" },
        strengths: { type: "array", items: { type: "string" } },
        gaps: { type: "array", items: { type: "string" } },
        questions: { type: "array", items: { type: "string" } },
      },
      required: ["score", "summary", "strengths", "gaps", "questions"],
    },
  );
  if (ai && typeof ai.score === "number" && Array.isArray(ai.strengths)) {
    return {
      score: clamp(Math.round(ai.score), 0, 100),
      summary: String(ai.summary ?? ""),
      strengths: ai.strengths.slice(0, 4).map(String),
      gaps: (ai.gaps ?? []).slice(0, 4).map(String),
      questions: (ai.questions ?? []).slice(0, 3).map(String),
      source: "ai",
    };
  }
  return matchResumeRules(job, resume);
}

/* ---------------- Ticket triage ---------------- */

export const TICKET_CATEGORIES = ["IT", "HR", "Payroll", "Facilities", "General"] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type Priority = "low" | "medium" | "high";

const CATEGORY_WORDS: Record<TicketCategory, string[]> = {
  IT: ["vpn", "laptop", "password", "login", "access", "wifi", "email", "slack", "software", "install", "database", "account", "mfa", "printer"],
  Payroll: ["salary", "payslip", "pf", "uan", "tds", "form", "16", "tax", "esi", "reimbursement", "bonus", "deduction", "ctc"],
  HR: ["leave", "insurance", "policy", "benefit", "parents", "maternity", "paternity", "probation", "notice", "harassment", "posh", "manager", "holiday"],
  Facilities: ["ac", "chair", "desk", "parking", "cafeteria", "room", "light", "water", "cleaning", "badge", "id", "card"],
  General: [],
};

export function triageTicketRules(subject: string, description: string): { category: TicketCategory; priority: Priority; source: AiSource } {
  const t = tokens(`${subject} ${description}`);
  let best: TicketCategory = "General";
  let bestScore = 0;
  for (const cat of TICKET_CATEGORIES) {
    const s = t.filter((w) => CATEGORY_WORDS[cat].includes(w)).length;
    if (s > bestScore) [best, bestScore] = [cat, s];
  }
  const text = `${subject} ${description}`.toLowerCase();
  const priority: Priority = /urgent|asap|cannot work|can't work|down|blocked|harass|unsafe|every\s+\d+\s+min|not paid|salary not/.test(text)
    ? "high"
    : /when you can|question|how do i|no rush/.test(text)
      ? "low"
      : "medium";
  return { category: best, priority, source: "rules" };
}

export async function triageTicket(subject: string, description: string) {
  const ai = await runJson<{ category: string; priority: string }>(
    [
      { role: "system", content: "You triage internal helpdesk tickets for an Indian company. Harassment, safety, pay not received, or someone unable to work is high priority." },
      { role: "user", content: `Subject: ${subject}\nDescription: ${description}\n\nReturn JSON: category (one of ${TICKET_CATEGORIES.join(", ")}) and priority (low, medium, high).` },
    ],
    {
      type: "object",
      properties: { category: { type: "string", enum: [...TICKET_CATEGORIES] }, priority: { type: "string", enum: ["low", "medium", "high"] } },
      required: ["category", "priority"],
    },
  );
  if (ai && (TICKET_CATEGORIES as readonly string[]).includes(ai.category) && ["low", "medium", "high"].includes(ai.priority)) {
    return { category: ai.category as TicketCategory, priority: ai.priority as Priority, source: "ai" as const };
  }
  return triageTicketRules(subject, description);
}

/* ---------------- Policy assistant ---------------- */

export interface Policy {
  title: string;
  body: string;
}

export function retrievePolicies(question: string, policies: Policy[], k = 3): Policy[] {
  const q = tokens(question);
  return policies
    .map((p) => {
      const pt = tokens(`${p.title} ${p.title} ${p.body}`);
      const score = q.reduce((s, w) => s + pt.filter((x) => x === w || (w.length > 4 && x.startsWith(w.slice(0, 5)))).length, 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => x.p);
}

export async function askAssistant(input: {
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
  policies: Policy[];
  context: string;
}): Promise<{ answer: string; sources: string[]; source: AiSource }> {
  const relevant = retrievePolicies(input.question + " " + input.history.slice(-2).map((h) => h.content).join(" "), input.policies);
  const docs = (relevant.length ? relevant : input.policies.slice(0, 3)).map((p) => `## ${p.title}\n${p.body}`).join("\n\n");
  const answer = await runText([
    {
      role: "system",
      content: `You are the HR+ assistant for Northwind Labs, an Indian company. Answer employee questions using ONLY the policies and the employee context below. If the answer isn't there, say you don't know and suggest raising a helpdesk ticket. Keep answers under 120 words, plain sentences, rupees as ₹. Never invent numbers.\n\nEmployee context:\n${input.context}\n\nPolicies:\n${docs}`,
    },
    ...input.history.slice(-6),
    { role: "user", content: input.question },
  ]);
  if (answer) return { answer, sources: relevant.map((p) => p.title), source: "ai" };

  if (!relevant.length) {
    return {
      answer: "I couldn't find that in the company policies. Raise a helpdesk ticket and the People team will get back to you.",
      sources: [],
      source: "rules",
    };
  }
  const top = relevant[0]!;
  const qTokens = new Set(tokens(input.question));
  const sentences = top.body.split(/(?<=\.)\s+/);
  const ranked = sentences
    .map((s, i) => ({ s, i, score: tokens(s).filter((t) => qTokens.has(t)).length }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, 3)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
  return { answer: ranked.join(" "), sources: [top.title], source: "rules" };
}

/* ---------------- Performance review drafting ---------------- */

export async function draftReview(input: {
  name: string;
  title: string;
  strengths: string;
  growth: string;
  goals: { title: string; progress: number }[];
  kudos: string[];
}): Promise<{ summary: string; rating: number; source: AiSource }> {
  const avg = input.goals.length ? input.goals.reduce((s, g) => s + g.progress, 0) / input.goals.length : 0.6;
  const ruleRating = avg >= 0.9 ? 5 : avg >= 0.75 ? 4 : avg >= 0.5 ? 3 : avg >= 0.3 ? 2 : 1;
  const ai = await runJson<{ summary: string; rating: number }>(
    [
      { role: "system", content: "You help managers write fair, specific performance reviews. Use only the facts given. 4-6 sentences, second paragraph optional. No clichés. Rating 1-5 where 3 means met expectations." },
      {
        role: "user",
        content: `Employee: ${input.name}, ${input.title}\nManager's notes on strengths: ${input.strengths || "(none)"}\nManager's notes on growth areas: ${input.growth || "(none)"}\nGoals and progress: ${input.goals.map((g) => `${g.title} (${Math.round(g.progress * 100)}%)`).join("; ") || "(none)"}\nRecognition from peers: ${input.kudos.join(" | ") || "(none)"}\n\nReturn JSON with summary and rating.`,
      },
    ],
    { type: "object", properties: { summary: { type: "string" }, rating: { type: "number" } }, required: ["summary", "rating"] },
  );
  if (ai?.summary) return { summary: ai.summary, rating: clamp(Math.round(ai.rating || ruleRating), 1, 5), source: "ai" };

  const first = input.name.split(" ")[0];
  const goalLine = input.goals.length
    ? `${first} is at ${Math.round(avg * 100)}% across ${input.goals.length} goals${input.goals[0] ? `, including "${input.goals[0].title}"` : ""}.`
    : "";
  const parts = [
    goalLine,
    input.strengths ? `Strengths this cycle: ${input.strengths.replace(/\.$/, "")}.` : "",
    input.kudos.length ? `Peers recognised ${first} for: ${input.kudos.slice(0, 2).join("; ").replace(/\.$/, "")}.` : "",
    input.growth ? `To grow next cycle: ${input.growth.replace(/\.$/, "")}.` : "",
  ].filter(Boolean);
  return { summary: parts.join(" "), rating: ruleRating, source: "rules" };
}

/* ---------------- Payroll review ---------------- */

export interface PayrollFinding {
  employee: string;
  severity: "info" | "warning" | "error";
  message: string;
}

export function payrollChecks(
  rows: { name: string; net: number; gross: number; daysPayable: number; daysInMonth: number; prevNet: number | null }[],
): PayrollFinding[] {
  const findings: PayrollFinding[] = [];
  for (const r of rows) {
    if (r.net <= 0) findings.push({ employee: r.name, severity: "error", message: "Net pay is zero or negative." });
    if (r.daysPayable < r.daysInMonth) findings.push({ employee: r.name, severity: "info", message: `${r.daysInMonth - r.daysPayable} unpaid day(s) deducted.` });
    if (r.prevNet && r.net > 0) {
      const change = (r.net - r.prevNet) / r.prevNet;
      if (Math.abs(change) >= 0.15)
        findings.push({ employee: r.name, severity: "warning", message: `Net pay ${change > 0 ? "up" : "down"} ${Math.round(Math.abs(change) * 100)}% from last month.` });
    }
    if (r.prevNet === null) findings.push({ employee: r.name, severity: "info", message: "First payroll for this employee." });
  }
  return findings;
}

export async function summarizePayroll(month: string, totals: { headcount: number; gross: number; net: number; prevNet: number | null }, findings: PayrollFinding[]) {
  const text = await runText([
    { role: "system", content: "You are a payroll auditor. Write 2-3 short sentences for the HR team summarising risks in this run. Mention the most important findings by name. No preamble." },
    {
      role: "user",
      content: `Month ${month}. Headcount ${totals.headcount}. Gross ₹${totals.gross}. Net ₹${totals.net}. Previous net ₹${totals.prevNet ?? "n/a"}.\nFindings:\n${findings.map((f) => `- [${f.severity}] ${f.employee}: ${f.message}`).join("\n") || "none"}`,
    },
  ]);
  if (text) return { summary: text, source: "ai" as const };
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning");
  const change = totals.prevNet ? Math.round(((totals.net - totals.prevNet) / totals.prevNet) * 100) : null;
  return {
    summary: [
      `${totals.headcount} payslips${change === null ? "" : `, net payout ${change >= 0 ? "up" : "down"} ${Math.abs(change)}% on last month`}.`,
      errors ? `${errors} payslip(s) have zero or negative net pay — fix before finalizing.` : "No blocking errors.",
      warnings.length ? `Check ${warnings.slice(0, 3).map((w) => w.employee).join(", ")} for large month-on-month changes.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    source: "rules" as const,
  };
}
