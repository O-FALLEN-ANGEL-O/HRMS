"use client";

import { motion } from "motion/react";
import { ClockAlert } from "lucide-react";
import { requestRegularization } from "@/app/actions/workday";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, SubmitButton } from "@/components/ui";
import { addDays, cn, formatDate, formatTime } from "@/lib/utils";

type DayState = "office" | "remote" | "field" | "leave" | "holiday" | "missing" | "weekend" | "future" | "partial";

const STYLE: Record<DayState, { cls: string; label: string }> = {
  office: { cls: "bg-ink text-paper", label: "Office" },
  remote: { cls: "bg-sky text-white dark:text-[#0c1a33]", label: "Remote" },
  field: { cls: "bg-sky/70 text-white", label: "Field" },
  leave: { cls: "bg-teal-soft text-teal", label: "Leave" },
  holiday: { cls: "bg-sky-soft text-sky", label: "Holiday" },
  missing: { cls: "border border-dashed border-rose text-rose", label: "Missing" },
  partial: { cls: "border border-rose bg-rose-soft text-rose", label: "No clock-out" },
  weekend: { cls: "text-ink-3 bg-[repeating-linear-gradient(135deg,transparent_0_5px,var(--surface-2)_5px_6px)]", label: "Weekend" },
  future: { cls: "bg-surface-2 text-ink-3", label: "" },
};

export function MonthGrid({ days, today }: { days: { date: string; state: DayState; hours: number | null; checkIn: string | null; checkOut: string | null }[]; today: string }) {
  const lead = new Date(`${days[0]!.date}T00:00:00Z`).getUTCDay();
  const legend: DayState[] = ["office", "remote", "leave", "holiday", "missing", "partial"];
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs" role="grid" aria-label="This month's attendance">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="pb-1 text-ink-3" aria-hidden>
            {d}
          </div>
        ))}
        {Array.from({ length: lead }).map((_, i) => (
          <div key={`l${i}`} />
        ))}
        {days.map((d, i) => (
          <motion.div
            key={d.date}
            role="gridcell"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.012, duration: 0.2 }}
            title={`${formatDate(d.date, { weekday: "long", day: "numeric", month: "long" })}: ${STYLE[d.state].label || "Upcoming"}${d.checkIn ? `, ${formatTime(d.checkIn)}–${formatTime(d.checkOut)}` : ""}`}
            aria-label={`${formatDate(d.date, { day: "numeric", month: "long" })}, ${STYLE[d.state].label || "upcoming"}${d.hours ? `, ${d.hours.toFixed(1)} hours` : ""}`}
            className={cn("grid aspect-square place-items-center rounded-[7px] text-[0.8rem] font-medium tabular", STYLE[d.state].cls, d.date === today && "ring-2 ring-marigold ring-offset-2 ring-offset-surface")}
          >
            {Number(d.date.slice(8))}
          </motion.div>
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-2">
        {legend.map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded-[3px]", STYLE[s].cls)} aria-hidden />
            {STYLE[s].label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CorrectionDialog({ today, suggest }: { today: string; suggest: string }) {
  return (
    <FormDialog
      title="Correct your attendance"
      description="For a day in the last week where you forgot to clock in or out."
      action={requestRegularization}
      trigger={
        <Button variant="outline">
          <ClockAlert aria-hidden /> Correct a day
        </Button>
      }
    >
      {() => (
        <>
          <Field label="Day" htmlFor="date">
            <input id="date" name="date" type="date" className="field" required defaultValue={suggest < today ? suggest : addDays(today, -1)} min={addDays(today, -7)} max={addDays(today, -1)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Clocked in at" htmlFor="checkIn">
              <input id="checkIn" name="checkIn" type="time" className="field" required defaultValue="09:30" />
            </Field>
            <Field label="Clocked out at" htmlFor="checkOut">
              <input id="checkOut" name="checkOut" type="time" className="field" required defaultValue="18:30" />
            </Field>
          </div>
          <Field label="What happened?" htmlFor="reason">
            <textarea id="reason" name="reason" className="field min-h-20" required minLength={8} placeholder="e.g. At a client site all day and forgot to clock in" />
          </Field>
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Sending">Send to manager</SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
