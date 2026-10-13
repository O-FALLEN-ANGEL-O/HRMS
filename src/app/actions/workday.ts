"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, lte, gte } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { assert, canApproveFor, requireUser } from "@/lib/auth";
import { dateStr, formObject, run, timeStr, UserError } from "@/lib/action";
import { audit, holidayDates, leaveBalances, notify } from "@/lib/queries";
import { addDays, daysBetween, formatDate, formatINR, newId, todayIST, workingDays } from "@/lib/utils";

const { attendance, leaveRequests, regularizations, expenses, employees, leaveTypes } = schema;

const istToIso = (date: string, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMinutes(h * 60 + m - 330);
  return d.toISOString();
};

function refresh(...paths: string[]) {
  for (const p of ["/home", "/approvals", ...paths]) revalidatePath(p);
  revalidatePath("/", "layout");
}

/* ---------------- Attendance ---------------- */

export async function clockIn(input: { mode: "office" | "remote" | "field"; lat?: number; lng?: number }) {
  return run(async () => {
    const user = await requireUser();
    const mode = z.enum(["office", "remote", "field"]).parse(input.mode);
    const db = await getDb();
    const today = todayIST();
    const existing = await db.query.attendance.findFirst({ where: and(eq(attendance.employeeId, user.id), eq(attendance.date, today)) });
    if (existing?.checkIn && !existing.checkOut) throw new UserError("You're already clocked in.");
    if (existing?.checkOut) {
      // Resume after clocking out: reopen the day, keeping the first check-in.
      await db.update(attendance).set({ checkOut: null }).where(eq(attendance.id, existing.id));
      refresh("/attendance");
      return { message: "Welcome back — your day is open again." };
    }
    await db.insert(attendance).values({
      id: newId("att"),
      employeeId: user.id,
      date: today,
      checkIn: new Date().toISOString(),
      mode,
      lat: typeof input.lat === "number" ? Math.round(input.lat * 1000) / 1000 : null,
      lng: typeof input.lng === "number" ? Math.round(input.lng * 1000) / 1000 : null,
    });
    refresh("/attendance");
    return { message: mode === "office" ? "Clocked in at the office." : mode === "remote" ? "Clocked in, working remotely." : "Clocked in from the field." };
  });
}

export async function clockOut() {
  return run(async () => {
    const user = await requireUser();
    const db = await getDb();
    const row = await db.query.attendance.findFirst({ where: and(eq(attendance.employeeId, user.id), eq(attendance.date, todayIST())) });
    if (!row?.checkIn) throw new UserError("You haven't clocked in today.");
    if (row.checkOut) throw new UserError("You've already clocked out.");
    await db.update(attendance).set({ checkOut: new Date().toISOString() }).where(eq(attendance.id, row.id));
    refresh("/attendance");
    return { message: "Clocked out. See you tomorrow." };
  });
}

const regSchema = z
  .object({ date: dateStr, checkIn: timeStr, checkOut: timeStr, reason: z.string().min(8, "Add a short reason (at least 8 characters).").max(500) })
  .refine((v) => v.checkOut > v.checkIn, { message: "Clock-out must be after clock-in.", path: ["checkOut"] });

export async function requestRegularization(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    const v = regSchema.parse(formObject(fd));
    const today = todayIST();
    if (v.date >= today) throw new UserError("Pick a past day. Today you can clock in and out directly.");
    if (daysBetween(v.date, today) > 7) throw new UserError("Corrections can be raised for the last 7 days only.");
    const db = await getDb();
    const dup = await db.query.regularizations.findFirst({ where: and(eq(regularizations.employeeId, user.id), eq(regularizations.date, v.date), eq(regularizations.status, "pending")) });
    if (dup) throw new UserError("You already have a pending correction for that day.");
    const id = newId("reg");
    await db.insert(regularizations).values({ id, employeeId: user.id, date: v.date, checkIn: istToIso(v.date, v.checkIn), checkOut: istToIso(v.date, v.checkOut), reason: v.reason });
    if (user.managerId) await notify(user.managerId, `${user.name.split(" ")[0]} asked to correct attendance for ${formatDate(v.date)}`, "/approvals");
    refresh("/attendance");
    return { message: "Correction sent to your manager." };
  });
}

/* ---------------- Time off ---------------- */

const leaveSchema = z
  .object({
    leaveTypeId: z.string().min(1, "Choose a leave type."),
    startDate: dateStr,
    endDate: dateStr,
    halfDay: z.enum(["on", "off"]).optional(),
    reason: z.string().min(3, "Add a reason.").max(400),
  })
  .refine((v) => v.endDate >= v.startDate, { message: "End date can't be before the start date.", path: ["endDate"] });

export async function applyLeave(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    const v = leaveSchema.parse(formObject(fd));
    const db = await getDb();
    const type = await db.query.leaveTypes.findFirst({ where: eq(leaveTypes.id, v.leaveTypeId) });
    if (!type) throw new UserError("That leave type doesn't exist.");
    if (v.startDate < addDays(todayIST(), -30)) throw new UserError("Leave can be backdated by 30 days at most.");
    const hol = await holidayDates();
    const halfDay = v.halfDay === "on";
    if (halfDay && v.startDate !== v.endDate) throw new UserError("A half day must start and end on the same date.");
    const working = workingDays(v.startDate, v.endDate, hol);
    if (working === 0) throw new UserError("Those dates are all weekends or holidays — no leave needed.");
    const days = halfDay ? 0.5 : working;

    const overlap = await db.query.leaveRequests.findFirst({
      where: and(eq(leaveRequests.employeeId, user.id), inArray(leaveRequests.status, ["pending", "approved"]), lte(leaveRequests.startDate, v.endDate), gte(leaveRequests.endDate, v.startDate)),
    });
    if (overlap) throw new UserError(`This overlaps your ${overlap.status} leave from ${formatDate(overlap.startDate)}.`);

    if (type.code !== "LOP") {
      const bal = (await leaveBalances(user.id, v.startDate.slice(0, 4))).find((b) => b.id === type.id)!;
      if (bal.remaining < days) throw new UserError(`You have ${bal.remaining} day(s) of ${type.name.toLowerCase()} left. Choose unpaid leave or fewer days.`);
    }

    const id = newId("lr");
    await db.insert(leaveRequests).values({ id, employeeId: user.id, leaveTypeId: type.id, startDate: v.startDate, endDate: v.endDate, days, halfDay, reason: v.reason });
    if (user.managerId) await notify(user.managerId, `${user.name.split(" ")[0]} requested ${days === 1 ? "1 day" : `${days} days`} of ${type.name.toLowerCase()}`, "/approvals");
    await audit(user.id, "leave.apply", "leave_request", id, { days });
    refresh("/time-off");
    return { message: `Requested ${days === 1 ? "1 day" : `${days} days`} of ${type.name.toLowerCase()}.` };
  });
}

export async function cancelLeave(id: string) {
  return run(async () => {
    const user = await requireUser();
    const db = await getDb();
    const r = await db.query.leaveRequests.findFirst({ where: eq(leaveRequests.id, id) });
    assert(r && r.employeeId === user.id, "You can only cancel your own requests.");
    if (r.status !== "pending" && !(r.status === "approved" && r.startDate > todayIST())) throw new UserError("Only pending or upcoming leave can be cancelled.");
    await db.update(leaveRequests).set({ status: "cancelled" }).where(eq(leaveRequests.id, id));
    refresh("/time-off");
    return { message: "Leave cancelled." };
  });
}

/* ---------------- Expenses ---------------- */

const expenseSchema = z.object({
  category: z.enum(["travel", "meals", "internet", "equipment", "learning", "other"], { message: "Choose a category." }),
  amount: z.coerce.number({ message: "Enter an amount." }).int("Use whole rupees.").min(1, "Enter an amount.").max(5_00_000, "Claims over ₹5,00,000 need Finance approval offline."),
  spentOn: dateStr,
  description: z.string().min(4, "Describe what this was for.").max(300),
});

export async function submitExpense(_: unknown, fd: FormData) {
  return run(async () => {
    const user = await requireUser();
    const v = expenseSchema.parse(formObject(fd));
    if (v.spentOn > todayIST()) throw new UserError("The date can't be in the future.");
    if (daysBetween(v.spentOn, todayIST()) > 30) throw new UserError("Claims must be filed within 30 days of spending.");
    if (v.category === "internet" && v.amount > 1000) throw new UserError("Internet is reimbursed up to ₹1,000 a month.");
    const db = await getDb();
    const id = newId("exp");
    await db.insert(expenses).values({ id, employeeId: user.id, ...v });
    if (user.managerId) await notify(user.managerId, `${user.name.split(" ")[0]} filed a ${formatINR(v.amount)} ${v.category} expense`, "/approvals");
    refresh("/expenses");
    return { message: `Filed ${formatINR(v.amount)} for approval.` };
  });
}

/* ---------------- Approvals ---------------- */

const decisionSchema = z.object({ id: z.string(), decision: z.enum(["approved", "rejected"]), note: z.string().max(300).optional() });

async function loadSubject(employeeId: string) {
  const db = await getDb();
  const emp = await db.query.employees.findFirst({ where: eq(employees.id, employeeId) });
  if (!emp) throw new UserError("That employee no longer exists.");
  return emp;
}

export async function decide(kind: "leave" | "regularization" | "expense", input: { id: string; decision: "approved" | "rejected"; note?: string }) {
  return run(async () => {
    const user = await requireUser();
    const v = decisionSchema.parse(input);
    const db = await getDb();
    const decidedAt = new Date().toISOString();
    const verb = v.decision === "approved" ? "approved" : "declined";

    if (kind === "leave") {
      const r = await db.query.leaveRequests.findFirst({ where: eq(leaveRequests.id, v.id) });
      if (!r || r.status !== "pending") throw new UserError("This request was already handled.");
      const emp = await loadSubject(r.employeeId);
      assert(canApproveFor(user, emp), "Only their manager or the People team can decide this.");
      await db.update(leaveRequests).set({ status: v.decision, approverId: user.id, decidedAt, decisionNote: v.note || null }).where(eq(leaveRequests.id, v.id));
      await notify(emp.id, `${user.name.split(" ")[0]} ${verb} your leave from ${formatDate(r.startDate)}`, "/time-off");
      await audit(user.id, `leave.${v.decision}`, "leave_request", v.id);
      refresh("/time-off");
      return { message: `Leave ${verb} for ${emp.name.split(" ")[0]}.` };
    }

    if (kind === "regularization") {
      const r = await db.query.regularizations.findFirst({ where: eq(regularizations.id, v.id) });
      if (!r || r.status !== "pending") throw new UserError("This request was already handled.");
      const emp = await loadSubject(r.employeeId);
      assert(canApproveFor(user, emp), "Only their manager or the People team can decide this.");
      await db.update(regularizations).set({ status: v.decision, approverId: user.id, decidedAt }).where(eq(regularizations.id, v.id));
      if (v.decision === "approved") {
        const existing = await db.query.attendance.findFirst({ where: and(eq(attendance.employeeId, emp.id), eq(attendance.date, r.date)) });
        if (existing) await db.update(attendance).set({ checkIn: r.checkIn, checkOut: r.checkOut, note: "Corrected" }).where(eq(attendance.id, existing.id));
        else await db.insert(attendance).values({ id: newId("att"), employeeId: emp.id, date: r.date, checkIn: r.checkIn, checkOut: r.checkOut, mode: "office", note: "Corrected" });
      }
      await notify(emp.id, `${user.name.split(" ")[0]} ${verb} your attendance correction for ${formatDate(r.date)}`, "/attendance");
      await audit(user.id, `regularization.${v.decision}`, "regularization", v.id);
      refresh("/attendance");
      return { message: `Attendance correction ${verb}.` };
    }

    const r = await db.query.expenses.findFirst({ where: eq(expenses.id, v.id) });
    if (!r || r.status !== "pending") throw new UserError("This claim was already handled.");
    const emp = await loadSubject(r.employeeId);
    assert(canApproveFor(user, emp), "Only their manager or the People team can decide this.");
    await db.update(expenses).set({ status: v.decision, approverId: user.id, decidedAt }).where(eq(expenses.id, v.id));
    await notify(emp.id, `${user.name.split(" ")[0]} ${verb} your ${formatINR(r.amount)} expense`, "/expenses");
    await audit(user.id, `expense.${v.decision}`, "expense", v.id);
    refresh("/expenses");
    return { message: `${formatINR(r.amount)} claim ${verb}.` };
  });
}

/** Approve every pending item of one kind that this user can decide. */
export async function approveAll(kind: "leave" | "regularization" | "expense", ids: string[]) {
  const results = [];
  for (const id of ids.slice(0, 50)) results.push(await decide(kind, { id, decision: "approved" }));
  const ok = results.filter((r) => r.ok).length;
  return ok === ids.length ? { ok: true as const, message: `Approved ${ok}.` } : { ok: false as const, error: `Approved ${ok} of ${ids.length}; the rest were already handled.` };
}
