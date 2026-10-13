"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, gte, inArray, lte, lt, ne } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { assert, canRunPayroll, requireUser } from "@/lib/auth";
import { run, UserError } from "@/lib/action";
import { computePayslip, daysInMonth } from "@/lib/payroll";
import { payrollChecks, summarizePayroll } from "@/lib/ai";
import { audit, holidayDates, notify } from "@/lib/queries";
import { formatINR, monthLabel, newId, todayIST, workingDays } from "@/lib/utils";

const { payrollRuns, payslips, employees, salaryStructures, leaveRequests, leaveTypes, expenses } = schema;

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);

export async function runPayroll(month: string) {
  return run(async () => {
    const user = await requireUser();
    assert(canRunPayroll(user), "Only HR and admins can run payroll.");
    const m = monthSchema.parse(month);
    if (m > todayIST().slice(0, 7)) throw new UserError("You can't run payroll for a future month.");
    const db = await getDb();
    const existing = await db.query.payrollRuns.findFirst({ where: eq(payrollRuns.month, m) });
    if (existing?.status === "finalized") throw new UserError(`${monthLabel(m)} is already finalized.`);

    const runId = existing?.id ?? newId("run");
    if (existing) await db.delete(payslips).where(eq(payslips.runId, runId));
    else await db.insert(payrollRuns).values({ id: runId, month: m, createdBy: user.id });
    try {
      const first = `${m}-01`;
      const last = `${m}-${String(daysInMonth(m)).padStart(2, "0")}`;
      const dim = daysInMonth(m);
      const [people, structures, lop, approvedExp, hol] = await Promise.all([
        db
          .select()
          .from(employees)
          .where(and(ne(employees.status, "exited"), lte(employees.joinedOn, last))),
        db.select().from(salaryStructures),
        db
          .select({ employeeId: leaveRequests.employeeId, start: leaveRequests.startDate, end: leaveRequests.endDate, halfDay: leaveRequests.halfDay })
          .from(leaveRequests)
          .innerJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
          .where(and(eq(leaveTypes.code, "LOP"), eq(leaveRequests.status, "approved"), lte(leaveRequests.startDate, last), gte(leaveRequests.endDate, first))),
        db.select().from(expenses).where(eq(expenses.status, "approved")),
        holidayDates(),
      ]);

      const prevRun = await db.query.payrollRuns.findFirst({
        where: and(lt(payrollRuns.month, m), eq(payrollRuns.status, "finalized")),
        orderBy: desc(payrollRuns.month),
      });
      const prevSlips = prevRun
        ? await db.select({ employeeId: payslips.employeeId, net: payslips.net }).from(payslips).where(eq(payslips.runId, prevRun.id))
        : [];

      const rows = [];
      for (const p of people) {
        const s = structures.find((x) => x.employeeId === p.id);
        if (!s) continue;
        // Unpaid days: LOP leave in the month, plus calendar days before joining / after exit.
        let unpaid = lop
          .filter((l) => l.employeeId === p.id)
          .reduce((acc, l) => acc + (l.halfDay ? 0.5 : workingDays(l.start < first ? first : l.start, l.end > last ? last : l.end, hol)), 0);
        if (p.joinedOn > first) unpaid += Number(p.joinedOn.slice(8)) - 1;
        if (p.exitOn && p.exitOn < last) unpaid += dim - Number(p.exitOn.slice(8));
        const reimb = approvedExp.filter((e) => e.employeeId === p.id).reduce((a, e) => a + e.amount, 0);
        const slip = computePayslip({ annualCtc: s.annualCtc, daysInMonth: dim, unpaidDays: Math.min(unpaid, dim), reimbursements: reimb });
        rows.push({ id: newId("ps"), runId, employeeId: p.id, ...slip, name: p.name });
      }
      if (!rows.length) throw new UserError("No one with a salary structure is on payroll for that month.");
      // D1 allows 100 bound parameters per statement; a payslip row has 14.
      for (let i = 0; i < rows.length; i += 7) {
        await db.insert(payslips).values(rows.slice(i, i + 7).map(({ name: _n, ...r }) => r));
      }

      const findings = payrollChecks(
        rows.map((r) => ({
          name: r.name,
          net: r.net,
          gross: r.gross,
          daysPayable: r.daysPayable,
          daysInMonth: dim,
          prevNet: prevSlips.find((x) => x.employeeId === r.employeeId)?.net ?? null,
        })),
      );
      const totals = {
        headcount: rows.length,
        gross: rows.reduce((a, r) => a + r.gross, 0),
        net: rows.reduce((a, r) => a + r.net, 0),
        prevNet: prevSlips.length ? prevSlips.reduce((a, r) => a + r.net, 0) : null,
      };
      const summary = await summarizePayroll(m, totals, findings);
      await db
        .update(payrollRuns)
        .set({ aiReview: JSON.stringify({ ...summary, findings, totals }) })
        .where(eq(payrollRuns.id, runId));
      await audit(user.id, "payroll.run", "payroll_run", runId, { month: m, headcount: rows.length });
      revalidatePath("/payroll");
      revalidatePath(`/payroll/${runId}`);
      return { message: `Draft ready: ${rows.length} payslips, ${formatINR(totals.net)} net.`, data: { runId } };
    } catch (err) {
      // D1 has no multi-statement transactions here, so undo a half-built new draft by hand.
      if (!existing) await db.delete(payrollRuns).where(eq(payrollRuns.id, runId));
      throw err;
    }
  });
}

export async function finalizePayroll(runId: string) {
  return run(async () => {
    const user = await requireUser();
    assert(canRunPayroll(user), "Only HR and admins can finalize payroll.");
    const db = await getDb();
    const r = await db.query.payrollRuns.findFirst({ where: eq(payrollRuns.id, runId) });
    if (!r) throw new UserError("Run not found.");
    if (r.status === "finalized") throw new UserError("Already finalized.");
    const review = r.aiReview ? (JSON.parse(r.aiReview) as { findings: { severity: string }[] }) : null;
    if (review?.findings.some((f) => f.severity === "error")) throw new UserError("Fix the payslips with errors before finalizing.");
    const slips = await db.select({ employeeId: payslips.employeeId, reimbursements: payslips.reimbursements }).from(payslips).where(eq(payslips.runId, runId));
    await db.update(payrollRuns).set({ status: "finalized", finalizedAt: new Date().toISOString() }).where(eq(payrollRuns.id, runId));
    const paidExp = slips.filter((s) => s.reimbursements > 0).map((s) => s.employeeId);
    if (paidExp.length)
      await db
        .update(expenses)
        .set({ status: "reimbursed" })
        .where(and(eq(expenses.status, "approved"), inArray(expenses.employeeId, paidExp)));
    for (const s of slips) await notify(s.employeeId, `Your payslip for ${monthLabel(r.month)} is ready`, "/payroll");
    await audit(user.id, "payroll.finalize", "payroll_run", runId);
    revalidatePath("/payroll");
    revalidatePath(`/payroll/${runId}`);
    revalidatePath("/expenses");
    return { message: `${monthLabel(r.month)} finalized. ${slips.length} people notified.` };
  });
}

export async function discardDraft(runId: string) {
  return run(async () => {
    const user = await requireUser();
    assert(canRunPayroll(user), "Only HR and admins can do this.");
    const db = await getDb();
    const r = await db.query.payrollRuns.findFirst({ where: eq(payrollRuns.id, runId) });
    if (!r || r.status !== "draft") throw new UserError("Only drafts can be discarded.");
    await db.delete(payrollRuns).where(eq(payrollRuns.id, runId));
    revalidatePath("/payroll");
    return { message: "Draft discarded." };
  });
}
