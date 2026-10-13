"use client";

import { useOptimistic, useTransition } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { toggleTask } from "@/app/actions/people";
import { Progress } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";

const OWNER: Record<string, string> = { hr: "HR", admin: "IT & admin", manager: "Manager", employee: "New joiner", recruiter: "Recruiter" };

export function Checklist({
  tasks,
  today,
  myRole,
  isManager,
  isPeople,
}: {
  tasks: { id: string; title: string; owner: string; dueOn: string; done: boolean }[];
  today: string;
  myRole: string;
  isManager: boolean;
  isPeople: boolean;
}) {
  const [state, flip] = useOptimistic(tasks, (s, id: string) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const [, start] = useTransition();
  const doneNow = state.filter((t) => t.done).length;

  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1">
          <Progress value={state.length ? doneNow / state.length : 0} tone="teal" label="Checklist progress" />
        </div>
        <span className="text-ink-2 tabular text-sm">
          {doneNow}/{state.length}
        </span>
      </div>
      <ul className="space-y-1">
        {state.map((t) => {
          const mine = isPeople || (t.owner === "manager" && isManager) || t.owner === myRole;
          const overdue = !t.done && t.dueOn < today;
          return (
            <li key={t.id}>
              <button
                disabled={!mine}
                onClick={() =>
                  start(async () => {
                    flip(t.id);
                    const r = await toggleTask(t.id);
                    if (!r.ok) toast.error(r.error);
                  })
                }
                className={cn("group flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left", mine ? "hover:bg-surface-2" : "cursor-default")}
                aria-pressed={t.done}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[6px] border transition-colors",
                    t.done ? "border-teal bg-teal text-white" : "border-line-strong bg-surface",
                  )}
                >
                  {t.done ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </motion.span>
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", t.done && "text-ink-3 decoration-ink-3/50 line-through")}>{t.title}</span>
                  <span className="text-ink-3 text-xs">
                    {OWNER[t.owner]}, due {formatDate(t.dueOn)}
                    {overdue ? <span className="text-rose ml-1">overdue</span> : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
