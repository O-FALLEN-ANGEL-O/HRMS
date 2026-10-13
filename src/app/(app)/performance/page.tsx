import { and, eq, inArray, or } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { quarterLabel, todayIST } from "@/lib/utils";
import { PerformanceView, type Objective, type Review } from "./client";

export const metadata = { title: "Goals & reviews" };

const reviewer = alias(schema.employees, "reviewer");

export default async function PerformancePage() {
  const user = await requireUser();
  const db = await getDb();
  const team = await db.select({ id: schema.employees.id }).from(schema.employees).where(eq(schema.employees.managerId, user.id));
  const teamIds = team.map((t) => t.id);
  const company = await db.select({ id: schema.employees.id }).from(schema.employees).where(eq(schema.employees.role, "admin"));
  const ownerIds = [user.id, ...teamIds, ...company.map((c) => c.id)];

  const [objRows, krRows, reviewRows] = await Promise.all([
    db
      .select({ o: schema.objectives, owner: schema.employees.name, hue: schema.employees.hue, managerId: schema.employees.managerId })
      .from(schema.objectives)
      .innerJoin(schema.employees, eq(schema.objectives.ownerId, schema.employees.id))
      .where(isPeopleTeam(user) ? undefined : inArray(schema.objectives.ownerId, ownerIds)),
    db.select().from(schema.keyResults),
    db
      .select({ r: schema.reviews, name: schema.employees.name, hue: schema.employees.hue, title: schema.employees.title, reviewer: reviewer.name })
      .from(schema.reviews)
      .innerJoin(schema.employees, eq(schema.reviews.employeeId, schema.employees.id))
      .innerJoin(reviewer, eq(schema.reviews.reviewerId, reviewer.id))
      .where(or(eq(schema.reviews.reviewerId, user.id), and(eq(schema.reviews.employeeId, user.id), eq(schema.reviews.status, "submitted")))),
  ]);

  const objectives: Objective[] = objRows.map(({ o, owner, hue, managerId }) => ({
    id: o.id,
    title: o.title,
    quarter: o.quarter,
    owner,
    hue,
    ownerId: o.ownerId,
    group: o.ownerId === user.id ? "mine" : company.some((c) => c.id === o.ownerId) ? "company" : "team",
    canEdit: o.ownerId === user.id || managerId === user.id || isPeopleTeam(user),
    krs: krRows
      .filter((k) => k.objectiveId === o.id)
      .map((k) => ({ id: k.id, title: k.title, start: k.start, target: k.target, current: k.current, unit: k.unit })),
  }));

  const reviews: Review[] = reviewRows.map(({ r, name, hue, title, reviewer }) => ({
    id: r.id,
    employee: name,
    hue,
    title,
    reviewer,
    cycle: r.cycle,
    rating: r.rating,
    strengths: r.strengths ?? "",
    growth: r.growth ?? "",
    summary: r.summary ?? "",
    status: r.status,
    aboutMe: r.employeeId === user.id,
  }));

  return (
    <>
      <PageHeader
        title="Goals & reviews"
        description={`${quarterLabel(todayIST())} goals for you${teamIds.length ? ", your team" : ""} and the company, plus performance reviews.`}
      />
      <PerformanceView objectives={objectives} reviews={reviews} hasTeam={teamIds.length > 0} />
    </>
  );
}
