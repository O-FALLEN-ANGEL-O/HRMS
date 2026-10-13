"use server";

import { revalidatePath } from "next/cache";
import { eq, max } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { assert, canManageAssets, isPeopleTeam, requireUser } from "@/lib/auth";
import { formObject, run, UserError } from "@/lib/action";
import { askAssistant, triageTicket } from "@/lib/ai";
import { audit, leaveBalances, notify } from "@/lib/queries";
import { formatDate, newId, todayIST } from "@/lib/utils";

const { assets, tickets, ticketComments, employees, surveyResponses, surveys, policies } = schema;

/* ---------------- Assets ---------------- */

const assetSchema = z.object({
  name: z.string().min(2, "Name the item.").max(80),
  category: z.enum(["laptop", "monitor", "phone", "accessory", "furniture"]),
  serial: z.string().max(60).optional(),
  cost: z.coerce.number().int().min(0).max(50_00_000),
});

export async function addAsset(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    assert(canManageAssets(user), "Only HR and admins manage assets.");
    const v = assetSchema.parse(formObject(fd));
    const db = await getDb();
    const count = await db.$count(assets);
    const tag = `NW-${1001 + count}`;
    await db.insert(assets).values({ id: newId("ast"), tag, ...v, serial: v.serial || null });
    revalidatePath("/assets");
    return { message: `Added ${v.name} as ${tag}.` };
  });
}

export async function assignAsset(id: string, employeeId: string | null) {
  return run(async () => {
    const user = await requireUser();
    assert(canManageAssets(user), "Only HR and admins manage assets.");
    const db = await getDb();
    const a = await db.query.assets.findFirst({ where: eq(assets.id, id) });
    if (!a) throw new UserError("Asset not found.");
    if (employeeId) {
      if (a.status === "retired") throw new UserError("Retired assets can't be assigned.");
      const emp = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
      if (!emp) throw new UserError("Choose someone to assign it to.");
      await db.update(assets).set({ status: "assigned", assignedTo: employeeId, assignedOn: todayIST() }).where(eq(assets.id, id));
      await notify(employeeId, `${a.name} (${a.tag}) is assigned to you`, "/assets");
      await audit(user.id, "asset.assign", "asset", id, { to: employeeId });
      revalidatePath("/assets");
      return { message: `${a.tag} assigned to ${emp.name.split(" ")[0]}.` };
    }
    await db.update(assets).set({ status: "available", assignedTo: null, assignedOn: null }).where(eq(assets.id, id));
    await audit(user.id, "asset.return", "asset", id);
    revalidatePath("/assets");
    return { message: `${a.tag} returned to inventory.` };
  });
}

export async function setAssetStatus(id: string, status: "available" | "repair" | "retired") {
  return run(async () => {
    const user = await requireUser();
    assert(canManageAssets(user), "Only HR and admins manage assets.");
    const db = await getDb();
    await db
      .update(assets)
      .set({ status: z.enum(["available", "repair", "retired"]).parse(status), assignedTo: null, assignedOn: null })
      .where(eq(assets.id, id));
    revalidatePath("/assets");
    return { message: status === "repair" ? "Sent for repair." : status === "retired" ? "Retired." : "Back in inventory." };
  });
}

/* ---------------- Helpdesk ---------------- */

const ticketSchema = z.object({
  subject: z.string().min(4, "Add a short subject.").max(120),
  description: z.string().min(10, "Describe the problem in a sentence or two.").max(3000),
});

export async function createTicket(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    const v = ticketSchema.parse(formObject(fd));
    const db = await getDb();
    const triage = await triageTicket(v.subject, v.description);
    const [{ n }] = await db.select({ n: max(tickets.number) }).from(tickets);
    const number = (n ?? 1040) + 1;
    const id = newId("tkt");
    await db.insert(tickets).values({ id, number, requesterId: user.id, ...v, category: triage.category, priority: triage.priority, triagedBy: triage.source });
    // Route to whoever handles that category.
    const handlerRole = triage.category === "IT" || triage.category === "Facilities" ? "admin" : "hr";
    const handlers = await db.select({ id: employees.id }).from(employees).where(eq(employees.role, handlerRole));
    for (const h of handlers) await notify(h.id, `New ${triage.priority}-priority ${triage.category} ticket #${number}: ${v.subject}`, `/helpdesk/${id}`);
    revalidatePath("/helpdesk");
    return {
      message: `Ticket #${number} raised as ${triage.category}, ${triage.priority} priority${triage.source === "ai" ? " (sorted by AI)" : ""}.`,
      data: { id },
    };
  });
}

export async function commentOnTicket(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    const v = z.object({ ticketId: z.string(), body: z.string().min(1, "Write a reply.").max(3000) }).parse(formObject(fd));
    const db = await getDb();
    const t = await db.query.tickets.findFirst({ where: eq(tickets.id, v.ticketId) });
    if (!t) throw new UserError("Ticket not found.");
    assert(t.requesterId === user.id || isPeopleTeam(user) || t.assigneeId === user.id, "You can't reply to this ticket.");
    await db.insert(ticketComments).values({ id: newId("tc"), ticketId: t.id, authorId: user.id, body: v.body });
    await db
      .update(tickets)
      .set({ updatedAt: new Date().toISOString(), status: t.status === "open" && user.id !== t.requesterId ? "in_progress" : t.status })
      .where(eq(tickets.id, t.id));
    const to = user.id === t.requesterId ? t.assigneeId : t.requesterId;
    if (to) await notify(to, `New reply on #${t.number}: ${t.subject}`, `/helpdesk/${t.id}`);
    revalidatePath(`/helpdesk/${t.id}`);
    return { message: "Reply sent." };
  });
}

export async function updateTicket(
  id: string,
  patch: {
    status?: "open" | "in_progress" | "resolved";
    assigneeId?: string | null;
    priority?: "low" | "medium" | "high";
    category?: "IT" | "HR" | "Payroll" | "Facilities" | "General";
  },
) {
  return run(async () => {
    const user = await requireUser();
    const db = await getDb();
    const t = await db.query.tickets.findFirst({ where: eq(tickets.id, id) });
    if (!t) throw new UserError("Ticket not found.");
    const requesterClosing = t.requesterId === user.id && patch.status === "resolved" && Object.keys(patch).length === 1;
    assert(isPeopleTeam(user) || t.assigneeId === user.id || requesterClosing, "Only the helpdesk team can change this.");
    const v = z
      .object({
        status: z.enum(["open", "in_progress", "resolved"]).optional(),
        assigneeId: z.string().nullable().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        category: z.enum(["IT", "HR", "Payroll", "Facilities", "General"]).optional(),
      })
      .parse(patch);
    await db
      .update(tickets)
      .set({ ...v, ...(v.category || v.priority ? { triagedBy: "person" as const } : {}), updatedAt: new Date().toISOString() })
      .where(eq(tickets.id, id));
    if (v.status === "resolved" && t.requesterId !== user.id) await notify(t.requesterId, `#${t.number} was resolved`, `/helpdesk/${id}`);
    if (v.assigneeId) await notify(v.assigneeId, `#${t.number} was assigned to you`, `/helpdesk/${id}`);
    revalidatePath(`/helpdesk/${id}`);
    revalidatePath("/helpdesk");
    return { message: v.status === "resolved" ? "Marked resolved." : "Ticket updated." };
  });
}

/* ---------------- HR assistant ---------------- */

export async function ask(question: string, history: { role: "user" | "assistant"; content: string }[]) {
  return run(async () => {
    const user = await requireUser();
    const q = z.string().min(2).max(500).parse(question.trim());
    const h = z
      .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
      .max(12)
      .parse(history);
    const db = await getDb();
    const [pols, balances, manager] = await Promise.all([
      db.select().from(policies),
      leaveBalances(user.id, todayIST().slice(0, 4)),
      user.managerId ? db.query.employees.findFirst({ where: eq(employees.id, user.managerId) }) : null,
    ]);
    const context = [
      `Name: ${user.name}. Role: ${user.title}, ${user.departmentName ?? ""}. Location: ${user.location}. Joined ${formatDate(user.joinedOn, { day: "numeric", month: "long", year: "numeric" })}. Employment: ${user.employmentType.replace("_", "-")}.`,
      manager ? `Manager: ${manager.name}.` : "",
      `Leave left this year: ${balances
        .filter((b) => b.code !== "LOP")
        .map((b) => `${b.name} ${b.remaining} of ${b.annualQuota}`)
        .join(", ")}.`,
      `Today is ${formatDate(todayIST(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`,
    ].join(" ");
    const res = await askAssistant({ question: q, history: h, policies: pols, context });
    return { data: res };
  });
}

/* ---------------- Surveys ---------------- */

export async function answerSurvey(surveyId: string, score: number, comment: string) {
  return run(async () => {
    const user = await requireUser();
    const db = await getDb();
    const s = await db.query.surveys.findFirst({ where: eq(surveys.id, surveyId) });
    if (!s || s.status !== "open") throw new UserError("This survey is closed.");
    const max = s.kind === "enps" ? 10 : 5;
    const v = z
      .object({
        score: z
          .number()
          .int()
          .min(s.kind === "enps" ? 0 : 1)
          .max(max),
        comment: z.string().max(500),
      })
      .parse({ score, comment });
    const existing = await db.query.surveyResponses.findFirst({ where: (r, { and, eq }) => and(eq(r.surveyId, surveyId), eq(r.employeeId, user.id)) });
    if (existing)
      await db
        .update(surveyResponses)
        .set({ score: v.score, comment: v.comment || null })
        .where(eq(surveyResponses.id, existing.id));
    else await db.insert(surveyResponses).values({ id: newId("sr"), surveyId, employeeId: user.id, score: v.score, comment: v.comment || null });
    revalidatePath("/surveys");
    return { message: existing ? "Answer updated." : "Thanks — your answer is anonymous in results." };
  });
}

export async function createSurvey(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    assert(isPeopleTeam(user), "Only the People team can launch surveys.");
    const v = z.object({ title: z.string().min(3).max(80), question: z.string().min(8).max(200), kind: z.enum(["enps", "pulse"]) }).parse(formObject(fd));
    const db = await getDb();
    await db.insert(surveys).values({ id: newId("srv"), ...v });
    revalidatePath("/surveys");
    return { message: "Survey launched to everyone." };
  });
}

export async function closeSurvey(id: string) {
  return run(async () => {
    const user = await requireUser();
    assert(isPeopleTeam(user), "Only the People team can close surveys.");
    const db = await getDb();
    await db.update(surveys).set({ status: "closed" }).where(eq(surveys.id, id));
    revalidatePath("/surveys");
    return { message: "Survey closed." };
  });
}
