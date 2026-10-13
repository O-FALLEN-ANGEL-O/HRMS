"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { assert, canRecruit, requireUser } from "@/lib/auth";
import { formObject, run, UserError } from "@/lib/action";
import { matchResume } from "@/lib/ai";
import { audit, notify } from "@/lib/queries";
import { CANDIDATE_STAGES } from "@/db/schema";
import { addDays, newId, todayIST } from "@/lib/utils";

const { jobs, candidates, employees, lifecycleTasks, salaryStructures } = schema;

async function canTouchJob(jobId: string) {
  const user = await requireUser();
  const db = await getDb();
  const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });
  if (!job) throw new UserError("That job no longer exists.");
  assert(canRecruit(user) || job.hiringManagerId === user.id, "Only recruiters, HR and the hiring manager can change this pipeline.");
  return { user, db, job };
}

const jobSchema = z.object({
  title: z.string().min(3, "Add a job title.").max(100),
  departmentId: z.string().min(1),
  location: z.string().min(2).max(60),
  workMode: z.enum(["onsite", "hybrid", "remote"]),
  openings: z.coerce.number().int().min(1).max(50),
  hiringManagerId: z.string().min(1, "Choose a hiring manager."),
  description: z.string().min(20, "Describe the role in a couple of sentences.").max(2000),
  requirements: z.string().min(10, "List a few requirements, one per line.").max(2000),
});

export async function createJob(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    assert(canRecruit(user), "Only recruiters and HR can open roles.");
    const v = jobSchema.parse(formObject(fd));
    const db = await getDb();
    const id = newId("job");
    await db.insert(jobs).values({ id, ...v });
    await notify(v.hiringManagerId, `${v.title} is open for hiring`, `/recruitment/${id}`);
    revalidatePath("/recruitment");
    return { message: `${v.title} is open.` };
  });
}

export async function setJobStatus(jobId: string, status: "open" | "paused" | "closed") {
  return run(async () => {
    const { db } = await canTouchJob(jobId);
    await db
      .update(jobs)
      .set({ status: z.enum(["open", "paused", "closed"]).parse(status) })
      .where(eq(jobs.id, jobId));
    revalidatePath("/recruitment");
    revalidatePath(`/recruitment/${jobId}`);
    return { message: status === "open" ? "Role reopened." : status === "paused" ? "Role paused." : "Role closed." };
  });
}

const candSchema = z.object({
  jobId: z.string(),
  name: z.string().min(2, "Enter the candidate's name.").max(80),
  email: z.email("Enter a valid email."),
  phone: z.string().max(20).optional(),
  source: z.string().max(40).optional(),
  resumeText: z.string().min(40, "Paste at least a few lines of the resume.").max(12000),
});

export async function addCandidate(_: unknown, fd: FormData) {
  return run(async () => {
    const v = candSchema.parse(formObject(fd));
    const { db, job } = await canTouchJob(v.jobId);
    const match = await matchResume(job, v.resumeText);
    await db.insert(candidates).values({
      id: newId("cand"),
      jobId: v.jobId,
      name: v.name,
      email: v.email,
      phone: v.phone || null,
      source: v.source || "Careers page",
      resumeText: v.resumeText,
      matchScore: match.score,
      matchSummary: JSON.stringify(match),
    });
    revalidatePath(`/recruitment/${v.jobId}`);
    revalidatePath("/recruitment");
    return { message: `${v.name} added with a ${match.score}% match.` };
  });
}

export async function scoreCandidate(id: string) {
  return run(async () => {
    const db = await getDb();
    const c = await db.query.candidates.findFirst({ where: eq(candidates.id, id) });
    if (!c) throw new UserError("Candidate not found.");
    const { job } = await canTouchJob(c.jobId);
    const match = await matchResume(job, c.resumeText);
    await db
      .update(candidates)
      .set({ matchScore: match.score, matchSummary: JSON.stringify(match) })
      .where(eq(candidates.id, id));
    revalidatePath(`/recruitment/${c.jobId}`);
    return { message: match.source === "ai" ? `Scored ${match.score}% with Workers AI.` : `Scored ${match.score}% with keyword matching (AI unavailable).` };
  });
}

export async function moveCandidate(id: string, stage: (typeof CANDIDATE_STAGES)[number]) {
  return run(async () => {
    const next = z.enum(CANDIDATE_STAGES).parse(stage);
    const db = await getDb();
    const c = await db.query.candidates.findFirst({ where: eq(candidates.id, id) });
    if (!c) throw new UserError("Candidate not found.");
    const { user, job } = await canTouchJob(c.jobId);
    if (c.stage === next) return {};
    if (c.stage === "hired") throw new UserError(`${c.name} is already hired and has an employee record.`);
    await db.update(candidates).set({ stage: next }).where(eq(candidates.id, id));
    await audit(user.id, "candidate.move", "candidate", id, { from: c.stage, to: next });

    // Hiring creates the employee and their onboarding checklist.
    if (next === "hired") {
      const count = await db.$count(employees);
      const empId = newId("emp");
      const joinedOn = addDays(todayIST(), 30);
      await db.insert(employees).values({
        id: empId,
        code: `E${String(count + 1).padStart(3, "0")}`,
        name: c.name,
        email: `${c.name.split(" ")[0]!.toLowerCase()}.${(c.name.split(" ")[1] ?? "new").toLowerCase()}@northwind-labs.example`,
        phone: c.phone,
        role: "employee",
        title: job.title,
        departmentId: job.departmentId,
        managerId: job.hiringManagerId,
        location: job.location,
        status: "onboarding",
        joinedOn,
        hue: Math.floor(Math.random() * 360),
      });
      await db.insert(salaryStructures).values({ employeeId: empId, annualCtc: 12_00_000, effectiveFrom: joinedOn });
      const steps: [string, "hr" | "admin" | "manager" | "employee", number][] = [
        ["Send welcome email and first-day plan", "hr", -5],
        ["Collect documents (PAN, Aadhaar, bank details)", "hr", -3],
        ["Prepare laptop and accounts", "admin", -1],
        ["Assign onboarding buddy", "manager", 0],
        ["Add to payroll and PF", "hr", 2],
        ["Set first-quarter goals", "manager", 14],
      ];
      await db
        .insert(lifecycleTasks)
        .values(
          steps.map(([title, ownerRole, off], i) => ({
            id: newId("lct"),
            employeeId: empId,
            kind: "onboarding" as const,
            title,
            ownerRole,
            dueOn: addDays(joinedOn, off),
            sort: i,
          })),
        );
      if (job.hiringManagerId) await notify(job.hiringManagerId, `${c.name} accepted — joining ${joinedOn}. Onboarding checklist created.`, "/lifecycle");
      revalidatePath("/lifecycle");
      revalidatePath("/people");
      revalidatePath(`/recruitment/${c.jobId}`);
      return { message: `${c.name} hired. Employee record and onboarding checklist created (CTC placeholder ₹12L, edit in their profile).` };
    }
    revalidatePath(`/recruitment/${c.jobId}`);
    revalidatePath("/recruitment");
    return { message: `${c.name} moved to ${next}.` };
  });
}
