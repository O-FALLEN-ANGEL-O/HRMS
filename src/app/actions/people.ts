"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { assert, canManagePeople, canPostAnnouncements, isPeopleTeam, requireUser } from "@/lib/auth";
import { dateStr, formObject, run, UserError } from "@/lib/action";
import { audit, notify } from "@/lib/queries";
import { addDays, newId, todayIST } from "@/lib/utils";
import { ROLES, KUDOS_VALUES } from "@/db/schema";

const { employees, lifecycleTasks, salaryStructures, announcements, kudos, assets } = schema;

const ONBOARDING: [string, (typeof ROLES)[number], number][] = [
  ["Send welcome email and first-day plan", "hr", -5],
  ["Collect documents (PAN, Aadhaar, bank details)", "hr", -3],
  ["Prepare laptop and accounts", "admin", -1],
  ["Assign onboarding buddy", "manager", 0],
  ["30-minute 1:1 with manager", "manager", 1],
  ["Add to payroll and PF", "hr", 2],
  ["Complete security and POSH training", "employee", 7],
  ["Set first-quarter goals", "manager", 14],
];
const OFFBOARDING: [string, (typeof ROLES)[number], number][] = [
  ["Accept resignation and confirm last working day", "hr", -60],
  ["Knowledge transfer plan", "manager", -14],
  ["Exit interview", "hr", -2],
  ["Collect laptop and ID card", "admin", 0],
  ["Revoke system access", "admin", 0],
  ["Full and final settlement", "hr", 45],
];

const newHire = z.object({
  name: z.string().min(2, "Enter their full name.").max(80),
  email: z.email("Enter a valid work email."),
  title: z.string().min(2, "Enter a job title.").max(80),
  departmentId: z.string().min(1, "Choose a department."),
  managerId: z.string().min(1, "Choose a manager."),
  role: z.enum(ROLES),
  location: z.string().min(2).max(60),
  employmentType: z.enum(["full_time", "contract", "intern"]),
  joinedOn: dateStr,
  annualCtc: z.coerce.number().int().min(1_00_000, "CTC looks too low — enter the annual amount in rupees.").max(5_00_00_000),
});

export async function addEmployee(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    assert(canManagePeople(user), "Only the People team can add employees.");
    const v = newHire.parse(formObject(fd));
    const db = await getDb();
    const dupe = await db.query.employees.findFirst({ where: eq(employees.email, v.email) });
    if (dupe) throw new UserError(`${dupe.name} already uses that email.`);
    const count = await db.$count(employees);
    const id = newId("emp");
    const code = `E${String(count + 1).padStart(3, "0")}`;
    const { annualCtc, ...profile } = v;
    await db.insert(employees).values({ id, code, ...profile, status: "onboarding", hue: Math.floor(Math.random() * 360) });
    await db.insert(salaryStructures).values({ employeeId: id, annualCtc, effectiveFrom: v.joinedOn });
    // Onboarding checklist, due dates relative to the joining date.
    await db
      .insert(lifecycleTasks)
      .values(
        ONBOARDING.map(([title, ownerRole, off], i) => ({
          id: newId("lct"),
          employeeId: id,
          kind: "onboarding" as const,
          title,
          ownerRole,
          dueOn: addDays(v.joinedOn, off),
          sort: i,
        })),
      );
    await notify(v.managerId, `${v.name} joins your team on ${v.joinedOn} — onboarding checklist created`, "/lifecycle");
    await audit(user.id, "employee.create", "employee", id, { code });
    revalidatePath("/people");
    revalidatePath("/lifecycle");
    return { message: `Added ${v.name} (${code}) with an 8-step onboarding checklist.` };
  });
}

const editSchema = z.object({
  id: z.string(),
  title: z.string().min(2).max(80).optional(),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  role: z.enum(ROLES).optional(),
  location: z.string().min(2).max(60).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(400).optional(),
  skills: z.string().max(200).optional(),
});

export async function updateEmployee(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    const v = editSchema.parse(formObject(fd));
    const self = v.id === user.id;
    assert(self || isPeopleTeam(user), "You can only edit your own profile.");
    const db = await getDb();
    const patch: Partial<typeof employees.$inferInsert> = {};
    // Everyone can edit their own contact details and bio; only HR changes job details.
    if (v.phone !== undefined) patch.phone = v.phone || null;
    if (v.bio !== undefined) patch.bio = v.bio || null;
    if (v.skills !== undefined) patch.skills = v.skills || null;
    if (isPeopleTeam(user)) {
      if (v.title) patch.title = v.title;
      if (v.departmentId) patch.departmentId = v.departmentId;
      if (v.location) patch.location = v.location;
      if (v.role && !(self && v.role !== user.role)) patch.role = v.role;
      if (v.managerId !== undefined) {
        if (v.managerId === v.id) throw new UserError("Someone can't report to themselves.");
        patch.managerId = v.managerId || null;
      }
    }
    await db.update(employees).set(patch).where(eq(employees.id, v.id));
    await audit(user.id, "employee.update", "employee", v.id, Object.keys(patch));
    revalidatePath(`/people/${v.id}`);
    revalidatePath("/people");
    return { message: self ? "Profile updated." : "Employee updated." };
  });
}

export async function startOffboarding(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    assert(canManagePeople(user), "Only the People team can start an exit.");
    const v = z.object({ id: z.string(), exitOn: dateStr, reason: z.string().max(200).optional() }).parse(formObject(fd));
    if (v.exitOn < todayIST()) throw new UserError("Pick a last working day from today onwards.");
    const db = await getDb();
    const emp = await db.query.employees.findFirst({ where: eq(employees.id, v.id) });
    if (!emp) throw new UserError("Employee not found.");
    if (emp.status === "offboarding") throw new UserError(`${emp.name} is already leaving.`);
    await db.update(employees).set({ status: "offboarding", exitOn: v.exitOn }).where(eq(employees.id, v.id));
    await db
      .insert(lifecycleTasks)
      .values(
        OFFBOARDING.map(([title, ownerRole, off], i) => ({
          id: newId("lct"),
          employeeId: v.id,
          kind: "offboarding" as const,
          title,
          ownerRole,
          dueOn: addDays(v.exitOn, off) < todayIST() ? todayIST() : addDays(v.exitOn, off),
          sort: i,
        })),
      );
    if (emp.managerId) await notify(emp.managerId, `${emp.name}'s last day is ${v.exitOn} — exit checklist created`, "/lifecycle");
    await audit(user.id, "employee.offboard", "employee", v.id, { exitOn: v.exitOn, reason: v.reason });
    revalidatePath(`/people/${v.id}`);
    revalidatePath("/lifecycle");
    return { message: `Exit started for ${emp.name}. 6 tasks created.` };
  });
}

export async function toggleTask(id: string) {
  return run(async () => {
    const user = await requireUser();
    const db = await getDb();
    const task = await db.query.lifecycleTasks.findFirst({ where: eq(lifecycleTasks.id, id) });
    if (!task) throw new UserError("Task not found.");
    const emp = await db.query.employees.findFirst({ where: eq(employees.id, task.employeeId) });
    const allowed =
      isPeopleTeam(user) || (task.ownerRole === "manager" && emp?.managerId === user.id) || (task.ownerRole === "employee" && task.employeeId === user.id);
    assert(allowed, "This task belongs to someone else.");
    const done = !task.doneAt;
    await db
      .update(lifecycleTasks)
      .set({ doneAt: done ? new Date().toISOString() : null })
      .where(eq(lifecycleTasks.id, id));

    // When everything is done, move the person to their next status.
    if (done && emp) {
      const open = await db.$count(
        lifecycleTasks,
        and(eq(lifecycleTasks.employeeId, emp.id), eq(lifecycleTasks.kind, task.kind), isNull(lifecycleTasks.doneAt)),
      );
      if (open === 0) {
        if (task.kind === "onboarding" && emp.status === "onboarding" && emp.joinedOn <= todayIST()) {
          await db.update(employees).set({ status: "active" }).where(eq(employees.id, emp.id));
        }
        if (task.kind === "offboarding" && emp.status === "offboarding") {
          await db.update(employees).set({ status: "exited" }).where(eq(employees.id, emp.id));
          await db.update(assets).set({ status: "available", assignedTo: null, assignedOn: null }).where(eq(assets.assignedTo, emp.id));
        }
      }
    }
    revalidatePath("/lifecycle");
    revalidatePath("/home");
    return { message: done ? "Done." : "Reopened." };
  });
}

export async function postAnnouncement(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    assert(canPostAnnouncements(user), "Only managers and the People team can post announcements.");
    const v = z
      .object({
        title: z.string().min(4, "Add a title.").max(120),
        body: z.string().min(10, "Write a little more.").max(2000),
        pinned: z.enum(["on"]).optional(),
      })
      .parse(formObject(fd));
    const db = await getDb();
    if (v.pinned && isPeopleTeam(user)) await db.update(announcements).set({ pinned: false });
    await db.insert(announcements).values({ id: newId("ann"), authorId: user.id, title: v.title, body: v.body, pinned: !!v.pinned && isPeopleTeam(user) });
    revalidatePath("/feed");
    revalidatePath("/home");
    return { message: "Posted." };
  });
}

export async function giveKudos(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    const v = z
      .object({ toId: z.string().min(1, "Choose someone."), value: z.enum(KUDOS_VALUES), message: z.string().min(8, "Say what they did.").max(280) })
      .parse(formObject(fd));
    if (v.toId === user.id) throw new UserError("Kudos are for other people.");
    const db = await getDb();
    const to = await db.query.employees.findFirst({ where: eq(employees.id, v.toId) });
    if (!to) throw new UserError("That person doesn't exist.");
    await db.insert(kudos).values({ id: newId("kd"), fromId: user.id, ...v });
    await notify(v.toId, `${user.name.split(" ")[0]} gave you kudos for ${v.value}`, "/feed");
    revalidatePath("/feed");
    revalidatePath("/home");
    return { message: `Kudos sent to ${to.name.split(" ")[0]}.` };
  });
}

export async function goToProfile(id: string) {
  redirect(`/people/${id}`);
}
