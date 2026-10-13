"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Plus, CheckCircle2 } from "lucide-react";
import { createTicket, updateTicket } from "@/app/actions/support";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, SubmitButton } from "@/components/ui";
import { cn } from "@/lib/utils";

export function NewTicket() {
  return (
    <FormDialog
      openParam="new"
      title="Raise a ticket"
      description="Describe the problem; it's sorted into the right team and priority automatically."
      action={createTicket}
      trigger={
        <Button variant="accent">
          <Plus aria-hidden /> Raise a ticket
        </Button>
      }
    >
      {() => (
        <>
          <Field label="Subject" htmlFor="subject">
            <input id="subject" name="subject" className="field" required minLength={4} placeholder="e.g. Can't connect to the VPN" />
          </Field>
          <Field label="Details" htmlFor="description">
            <textarea
              id="description"
              name="description"
              className="field min-h-32"
              required
              minLength={10}
              placeholder="What happened, since when, and what you've tried"
            />
          </Field>
          <div className="flex justify-end">
            <SubmitButton variant="accent" pendingLabel="Sorting…">
              Raise ticket
            </SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}

export function TicketFilters({ view, counts }: { view: string; counts: { open: number; resolved: number; all: number } }) {
  return (
    <nav aria-label="Ticket views" className="flex gap-1.5">
      {(["open", "resolved", "all"] as const).map((v) => (
        <Link
          key={v}
          href={`/helpdesk?view=${v}`}
          aria-current={view === v ? "page" : undefined}
          className={cn(
            "rounded-full border px-3 py-1 text-sm capitalize",
            view === v ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-2 hover:border-line-strong",
          )}
        >
          {v} <span className="tabular opacity-70">{counts[v]}</span>
        </Link>
      ))}
    </nav>
  );
}

export function TicketSidebar({
  id,
  status,
  priority,
  category,
  assigneeId,
  people,
  desk,
  isRequester,
}: {
  id: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  category: "IT" | "HR" | "Payroll" | "Facilities" | "General";
  assigneeId: string | null;
  people: { id: string; name: string }[];
  desk: boolean;
  isRequester: boolean;
}) {
  const [pending, start] = useTransition();
  const set = (patch: Parameters<typeof updateTicket>[1]) =>
    start(async () => {
      const r = await updateTicket(id, patch);
      r.ok ? toast.success(r.message) : toast.error(r.error);
    });
  if (!desk)
    return isRequester && status !== "resolved" ? (
      <Button variant="outline" className="w-full" onClick={() => set({ status: "resolved" })} disabled={pending}>
        <CheckCircle2 aria-hidden /> It&apos;s fixed, close ticket
      </Button>
    ) : null;
  return (
    <div className="space-y-4">
      <Field label="Status" htmlFor="t-status">
        <select id="t-status" className="field" value={status} disabled={pending} onChange={(e) => set({ status: e.target.value as typeof status })}>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </Field>
      <Field label="Assigned to" htmlFor="t-assignee">
        <select id="t-assignee" className="field" value={assigneeId ?? ""} disabled={pending} onChange={(e) => set({ assigneeId: e.target.value || null })}>
          <option value="">Unassigned</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Team" htmlFor="t-cat">
          <select id="t-cat" className="field" value={category} disabled={pending} onChange={(e) => set({ category: e.target.value as typeof category })}>
            {["IT", "HR", "Payroll", "Facilities", "General"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority" htmlFor="t-pri">
          <select id="t-pri" className="field" value={priority} disabled={pending} onChange={(e) => set({ priority: e.target.value as typeof priority })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
      </div>
    </div>
  );
}
