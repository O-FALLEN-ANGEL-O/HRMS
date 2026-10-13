"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { assert, isPeopleTeam, requireUser } from "@/lib/auth";
import { run, UserError } from "@/lib/action";
import { draftReview } from "@/lib/ai";
import { notify } from "@/lib/queries";
import { newId, quarterLabel, todayIST } from "@/lib/utils";

const { objectives, keyResults, reviews, employees, kudos } = schema;

const objSchema = z.object({
  title: z.string().min(5, "Describe the goal in a sentence.").max(140),
  krs: z
    .array(z.object({ title: z.string().min(3).max(120), start: z.coerce.number(), target: z.coerce.number(), unit: z.string().max(12) }))
    .min(1, "Add at least one key result.")
    .max(5),
});

export async function createObjective(input: z.input<typeof objSchema>) {
  return run(async () => {
    const user = await requireUser();
    const v = objSchema.parse(input);
    for (const kr of v.krs) if (kr.start === kr.target) throw new UserError(`"${kr.title}": start and target can't be the same.`);
    const db = await getDb();
    const id = newId("obj");
    await db.insert(objectives).values({ id, ownerId: user.id, title: v.title, quarter: quarterLabel(todayIST()) });
    await db
      .insert(keyResults)
      .values(
        v.krs.map((k) => ({ id: newId("kr"), objectiveId: id, title: k.title, start: k.start, target: k.target, current: k.start, unit: k.unit || "%" })),
      );
    revalidatePath("/performance");
    revalidatePath("/home");
    return { message: "Goal added." };
  });
}

export async function updateKeyResult(id: string, current: number) {
  return run(async () => {
    const user = await requireUser();
    if (!Number.isFinite(current)) throw new UserError("Enter a number.");
    const db = await getDb();
    const kr = await db.query.keyResults.findFirst({ where: eq(keyResults.id, id) });
    if (!kr) throw new UserError("Key result not found.");
    const obj = await db.query.objectives.findFirst({ where: eq(objectives.id, kr.objectiveId) });
    const owner = obj ? await db.query.employees.findFirst({ where: eq(employees.id, obj.ownerId) }) : null;
    assert(owner && (owner.id === user.id || owner.managerId === user.id || isPeopleTeam(user)), "Only the goal's owner or their manager can update it.");
    await db.update(keyResults).set({ current }).where(eq(keyResults.id, id));
    revalidatePath("/performance");
    revalidatePath("/home");
    return { message: "Progress saved." };
  });
}

export async function deleteObjective(id: string) {
  return run(async () => {
    const user = await requireUser();
    const db = await getDb();
    const obj = await db.query.objectives.findFirst({ where: eq(objectives.id, id) });
    assert(obj && (obj.ownerId === user.id || isPeopleTeam(user)), "You can only remove your own goals.");
    await db.delete(objectives).where(eq(objectives.id, id));
    revalidatePath("/performance");
    return { message: "Goal removed." };
  });
}

const reviewSchema = z.object({
  id: z.string(),
  strengths: z.string().max(1500),
  growth: z.string().max(1500),
  summary: z.string().max(4000),
  rating: z.coerce.number().int().min(1).max(5).nullable(),
  submit: z.boolean(),
});

async function loadReview(id: string) {
  const user = await requireUser();
  const db = await getDb();
  const r = await db.query.reviews.findFirst({ where: eq(reviews.id, id) });
  if (!r) throw new UserError("Review not found.");
  assert(r.reviewerId === user.id || isPeopleTeam(user), "Only the reviewer can edit this review.");
  return { user, db, r };
}

export async function aiDraftReview(id: string, notes: { strengths: string; growth: string }) {
  return run(async () => {
    const { db, r } = await loadReview(id);
    if (r.status === "submitted") throw new UserError("This review is already submitted.");
    const emp = await db.query.employees.findFirst({ where: eq(employees.id, r.employeeId) });
    const goals = await db
      .select({ title: objectives.title, start: keyResults.start, target: keyResults.target, current: keyResults.current })
      .from(objectives)
      .innerJoin(keyResults, eq(keyResults.objectiveId, objectives.id))
      .where(eq(objectives.ownerId, r.employeeId));
    const praise = await db.select({ m: kudos.message }).from(kudos).where(eq(kudos.toId, r.employeeId)).orderBy(desc(kudos.createdAt)).limit(5);
    const byObj = new Map<string, number[]>();
    for (const g of goals)
      byObj.set(g.title, [...(byObj.get(g.title) ?? []), g.target === g.start ? 1 : Math.max(0, Math.min(1, (g.current - g.start) / (g.target - g.start)))]);
    const draft = await draftReview({
      name: emp?.name ?? "This employee",
      title: emp?.title ?? "",
      strengths: notes.strengths,
      growth: notes.growth,
      goals: [...byObj.entries()].map(([title, p]) => ({ title, progress: p.reduce((a, b) => a + b, 0) / p.length })),
      kudos: praise.map((p) => p.m),
    });
    return {
      data: draft,
      message:
        draft.source === "ai" ? "Draft written by Workers AI. Edit it before submitting." : "Draft assembled from your notes and their goals (AI unavailable).",
    };
  });
}

export async function saveReview(input: z.input<typeof reviewSchema>) {
  return run(async () => {
    const v = reviewSchema.parse(input);
    const { user, db, r } = await loadReview(v.id);
    if (r.status === "submitted") throw new UserError("This review is already submitted.");
    if (v.submit && (!v.rating || v.summary.trim().length < 40))
      throw new UserError("Add a rating and a summary of at least a few sentences before submitting.");
    await db
      .update(reviews)
      .set({ strengths: v.strengths || null, growth: v.growth || null, summary: v.summary || null, rating: v.rating, status: v.submit ? "submitted" : "draft" })
      .where(eq(reviews.id, v.id));
    if (v.submit) await notify(r.employeeId, `${user.name.split(" ")[0]} shared your ${r.cycle} review`, "/performance");
    revalidatePath("/performance");
    return { message: v.submit ? "Review submitted and shared." : "Draft saved." };
  });
}
