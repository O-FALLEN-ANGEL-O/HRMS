"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CalendarPlus, ChevronLeft, ChevronRight, TreePalm } from "lucide-react";
import { applyLeave, cancelLeave } from "@/app/actions/workday";
import { FormDialog } from "@/components/form-dialog";
import { Button, EmptyState, Field, StatusPill, SubmitButton } from "@/components/ui";
import { addDays, cn, formatDate, isWeekend, plural, workingDays } from "@/lib/utils";

export function ApplyLeave({ types, balances, today, holidays }: { types: { id: string; name: string; code: string }[]; balances: { id: string; remaining: number }[]; today: string; holidays: string[] }) {
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [start, setStart] = useState(addDays(today, 1));
  const [end, setEnd] = useState(addDays(today, 1));
  const [half, setHalf] = useState(false);
  const days = start && end && end >= start ? (half ? 0.5 : workingDays(start, end, holidays)) : 0;
  const remaining = balances.find((b) => b.id === typeId)?.remaining;
  const isLop = types.find((t) => t.id === typeId)?.code === "LOP";

  return (
    <FormDialog
      openParam="new"
      title="Apply for time off"
      description="Your manager gets notified right away."
      action={applyLeave}
      trigger={
        <Button variant="accent">
          <CalendarPlus aria-hidden /> Apply for time off
        </Button>
      }
    >
      {({ fieldErrors }) => (
        <>
          <Field label="Type" htmlFor="leaveTypeId">
            <select id="leaveTypeId" name="leaveTypeId" className="field" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.code !== "LOP" ? ` (${balances.find((b) => b.id === t.id)?.remaining ?? 0} left)` : ""}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="From" htmlFor="startDate">
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="field"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (end < e.target.value) setEnd(e.target.value);
                }}
              />
            </Field>
            <Field label="To" htmlFor="endDate">
              <input id="endDate" name="endDate" type="date" required min={start} className="field" value={end} onChange={(e) => setEnd(e.target.value)} aria-invalid={!!fieldErrors?.endDate} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="halfDay" className="size-4 accent-[var(--ink)]" checked={half} disabled={start !== end} onChange={(e) => setHalf(e.target.checked)} />
            Half day
          </label>
          <p className={cn("rounded-lg px-3 py-2 text-sm", !isLop && remaining !== undefined && days > remaining ? "bg-rose-soft text-rose" : "bg-surface-2 text-ink-2")} aria-live="polite">
            {days === 0 ? "Those dates are weekends or holidays." : `${plural(days, "working day")}`}
            {!isLop && remaining !== undefined ? `, ${Math.max(0, remaining - days)} left after this` : isLop ? ", deducted from salary" : ""}
          </p>
          <Field label="Reason" htmlFor="reason">
            <textarea id="reason" name="reason" required minLength={3} className="field min-h-20" placeholder="A few words for your manager" />
          </Field>
          <div className="flex justify-end">
            <SubmitButton variant="accent" pendingLabel="Sending">
              Send request
            </SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}

export function Balances({ balances }: { balances: { id: string; name: string; code: string; quota: number; used: number; pending: number; remaining: number; hue: number }[] }) {
  return (
    <section aria-label="Balances" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {balances.map((b, i) => {
        const isLop = b.code === "LOP";
        const usedPct = b.quota ? b.used / b.quota : 0;
        const pendPct = b.quota ? b.pending / b.quota : 0;
        return (
          <div key={b.id} className="panel p-4">
            <p className="text-sm text-ink-2">{b.name}</p>
            {isLop ? (
              <>
                <p className="mt-1 font-display text-3xl font-semibold tabular">{b.used}</p>
                <p className="text-xs text-ink-3">days taken this year</p>
              </>
            ) : (
              <>
                <p className="mt-1 font-display text-3xl font-semibold tabular">
                  {b.remaining}
                  <span className="ml-1 text-base font-normal text-ink-3">/ {b.quota}</span>
                </p>
                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                  <motion.div className="h-full" style={{ background: `oklch(0.62 0.12 ${b.hue})` }} initial={{ width: 0 }} animate={{ width: `${usedPct * 100}%` }} transition={{ delay: i * 0.06, type: "spring", stiffness: 120, damping: 20 }} />
                  <motion.div className="h-full opacity-40" style={{ background: `oklch(0.62 0.12 ${b.hue})` }} initial={{ width: 0 }} animate={{ width: `${pendPct * 100}%` }} transition={{ delay: 0.2 + i * 0.06 }} />
                </div>
                <p className="mt-1.5 text-xs text-ink-3">
                  {b.used} used{b.pending ? `, ${b.pending} pending` : ""}
                </p>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}

export function MyRequests({ rows, today }: { rows: { id: string; type: string; hue: number; start: string; end: string; days: number; status: string; reason: string; approver: string | null; note: string | null }[]; today: string }) {
  const [pending, start] = useTransition();
  if (!rows.length)
    return (
      <EmptyState icon={<TreePalm />} title="No time off yet this year">
        When you apply, your requests and their status show up here.
      </EmptyState>
    );
  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => (
        <li key={r.id} className="px-5 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="size-2 rounded-full" style={{ background: `oklch(0.62 0.12 ${r.hue})` }} aria-hidden />
                {r.type}, {plural(r.days, "day")}
              </p>
              <p className="text-sm text-ink-2">
                {formatDate(r.start)}
                {r.end !== r.start ? ` to ${formatDate(r.end)}` : ""}
              </p>
              {r.note ? <p className="mt-1 text-sm text-ink-2">{r.approver?.split(" ")[0]}: &ldquo;{r.note}&rdquo;</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <StatusPill status={r.status} />
              {r.status === "pending" || (r.status === "approved" && r.start > today) ? (
                <button
                  className="text-xs text-ink-3 underline-offset-2 hover:text-rose hover:underline disabled:opacity-50"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const res = await cancelLeave(r.id);
                      res.ok ? toast.success(res.message) : toast.error(res.error);
                    })
                  }
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

type CalLeave = { id: string; employeeId: string; name: string; hue: number; start: string; end: string; status: string; type: string };

export function TeamCalendar({ start, month, today, leave, holidays, meId }: { start: string; month: string; today: string; leave: CalLeave[]; holidays: { date: string; name: string }[]; meId: string }) {
  const [offset, setOffset] = useState(0); // weeks shown start at `start`; arrows move a week
  const days = useMemo(() => Array.from({ length: 35 }, (_, i) => addDays(start, i + offset * 7)), [start, offset]);
  const hol = new Map(holidays.map((h) => [h.date, h.name]));
  const outOn = (d: string) => leave.filter((l) => l.start <= d && l.end >= d && !isWeekend(d) && !hol.has(d));
  const label = formatDate(days[14]!, { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-2">
        <p className="font-display font-semibold">{label}</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setOffset((o) => o - 1)} disabled={offset <= -4} aria-label="Previous week">
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOffset(0)} disabled={offset === 0}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 4} aria-label="Next week">
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[10px] border border-line bg-line text-xs" role="grid" aria-label={`Leave calendar, ${label}`}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} role="columnheader" className="bg-surface-2 px-2 py-1.5 text-center font-medium text-ink-3">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const out = outOn(d);
          const weekend = isWeekend(d);
          const holiday = hol.get(d);
          return (
            <div
              key={d}
              role="gridcell"
              aria-label={`${formatDate(d, { weekday: "long", day: "numeric", month: "long" })}${holiday ? `, ${holiday}` : ""}${out.length ? `, off: ${out.map((o) => o.name).join(", ")}` : ""}`}
              className={cn("min-h-[84px] bg-surface p-1.5", (weekend || d.slice(0, 7) !== month) && "bg-surface/60", weekend && "bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--surface-2)_6px_7px)]")}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={cn("grid size-6 place-items-center rounded-full tabular", d === today ? "bg-marigold font-semibold text-[#2a1b00]" : d.slice(0, 7) === month ? "text-ink" : "text-ink-3")}>{Number(d.slice(8))}</span>
              </div>
              {holiday ? <p className="truncate rounded bg-sky-soft px-1 py-0.5 text-[0.7rem] text-sky">{holiday}</p> : null}
              <div className="space-y-0.5">
                {out.slice(0, 3).map((o) => (
                  <div key={o.id} className={cn("flex items-center gap-1 truncate rounded px-1 py-0.5 text-[0.7rem]", o.status === "pending" ? "border border-dashed border-line-strong" : "")} style={o.status === "approved" ? { background: `oklch(0.93 0.04 ${o.hue})`, color: `oklch(0.35 0.08 ${o.hue})` } : undefined}>
                    <span className="truncate">{o.employeeId === meId ? "You" : o.name.split(" ")[0]}</span>
                  </div>
                ))}
                {out.length > 3 ? <p className="px-1 text-[0.7rem] text-ink-3">+{out.length - 3} more</p> : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 px-2 text-xs text-ink-3">Dashed means waiting for approval.</p>
    </div>
  );
}

