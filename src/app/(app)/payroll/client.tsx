"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Play, CheckCheck, Trash2, Printer } from "lucide-react";
import { discardDraft, finalizePayroll, runPayroll } from "@/app/actions/payroll";
import { Button } from "@/components/ui";

export function RunPayroll({ month, label, rerun }: { month: string; label: string; rerun: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="accent"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await runPayroll(month);
          if (r.ok) {
            toast.success(r.message);
            if (r.data?.runId) router.push(`/payroll/${r.data.runId}`);
          } else toast.error(r.error);
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Play aria-hidden />}
      {pending ? "Calculating…" : rerun ? `Recalculate ${label}` : `Run payroll for ${label}`}
    </Button>
  );
}

export function RunActions({ runId, month, status, hasErrors }: { runId: string; month: string; status: "draft" | "finalized"; hasErrors: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  if (status === "finalized")
    return (
      <Button variant="outline" onClick={() => window.print()} className="no-print">
        <Printer aria-hidden /> Print register
      </Button>
    );
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button
        variant="ghost"
        disabled={pending}
        onClick={() =>
          confirm("Discard this draft? You can run it again any time.") &&
          start(async () => {
            const r = await discardDraft(runId);
            if (r.ok) {
              toast.success(r.message);
              router.push("/payroll");
            } else toast.error(r.error);
          })
        }
      >
        <Trash2 aria-hidden /> Discard
      </Button>
      <RunPayroll month={month} label="" rerun />
      <Button
        variant="approve"
        disabled={pending || hasErrors}
        title={hasErrors ? "Fix the errors flagged below first" : undefined}
        onClick={() =>
          confirm("Finalize and publish payslips to everyone? This can't be undone.") &&
          start(async () => {
            const r = await finalizePayroll(runId);
            r.ok ? toast.success(r.message) : toast.error(r.error);
          })
        }
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <CheckCheck aria-hidden />} Finalize and publish
      </Button>
    </div>
  );
}

export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()} className="no-print">
      <Printer aria-hidden /> Print or save as PDF
    </Button>
  );
}
