"use client";

import { useEffect, useRef } from "react";
import { ActionForm, useActionForm } from "@/components/action-form";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resetDemo, updatePolicy, updateRules } from "@/app/actions/settings";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, SubmitButton } from "@/components/ui";

export function PolicyEditor({ policy }: { policy: { id: string; title: string; body: string } }) {
  return (
    <FormDialog
      side="right"
      title="Edit policy"
      description="The HR assistant answers from this text, so keep numbers exact."
      action={updatePolicy}
      trigger={
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      }
    >
      {() => (
        <>
          <input type="hidden" name="id" value={policy.id} />
          <Field label="Title" htmlFor={`pt-${policy.id}`}>
            <input id={`pt-${policy.id}`} name="title" className="field" defaultValue={policy.title} required />
          </Field>
          <Field label="Policy text" htmlFor={`pb-${policy.id}`}>
            <textarea id={`pb-${policy.id}`} name="body" className="field min-h-72" defaultValue={policy.body} required />
          </Field>
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Saving">Save policy</SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}

export function ResetDemo() {
  return (
    <form action={resetDemo} onSubmit={(e) => !confirm("Reset all demo data now? Everyone will be signed out.") && e.preventDefault()} className="mt-3">
      <SubmitButton variant="danger" pendingLabel="Resetting">
        <RotateCcw aria-hidden /> Reset demo data
      </SubmitButton>
    </form>
  );
}

type Rules = {
  coreStart: string;
  coreEnd: string;
  leaveBackdateDays: number;
  claimWindowDays: number;
  internetMonthlyLimit: number;
  receiptRequiredAbove: number;
  emailNotifications: boolean;
};

/** Company rules that used to be hard-coded. Saved as one form. */
export function RulesForm({ rules }: { rules: Rules }) {
  const form = useActionForm(updateRules);
  const state = form.state;
  const seen = useRef<typeof state>(null);
  useEffect(() => {
    if (!state || seen.current === state) return;
    seen.current = state;
    if (state.ok) toast.success(state.message ?? "Saved.");
    else toast.error(state.error);
  }, [state]);
  const err = (k: string) => (state && !state.ok ? state.fieldErrors?.[k] : undefined);
  const fieldErr = (k: string) =>
    err(k) ? (
      <p className="text-rose mt-1 text-xs" role="alert">
        {err(k)}
      </p>
    ) : null;
  return (
    <ActionForm form={form} className="space-y-5">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Attendance</legend>
        <Field label="Core hours start" htmlFor="coreStart" hint="Clocking in after this counts as late.">
          <input id="coreStart" name="coreStart" type="time" className="field" defaultValue={rules.coreStart} required />
          {fieldErr("coreStart")}
        </Field>
        <Field label="Core hours end" htmlFor="coreEnd">
          <input id="coreEnd" name="coreEnd" type="time" className="field" defaultValue={rules.coreEnd} required />
          {fieldErr("coreEnd")}
        </Field>
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Time off</legend>
        <Field label="Leave can be backdated by (days)" htmlFor="leaveBackdateDays">
          <input
            id="leaveBackdateDays"
            name="leaveBackdateDays"
            type="number"
            min={0}
            max={365}
            className="field tabular"
            defaultValue={rules.leaveBackdateDays}
            required
          />
          {fieldErr("leaveBackdateDays")}
        </Field>
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold">Expenses</legend>
        <Field label="File claims within (days)" htmlFor="claimWindowDays">
          <input
            id="claimWindowDays"
            name="claimWindowDays"
            type="number"
            min={1}
            max={365}
            className="field tabular"
            defaultValue={rules.claimWindowDays}
            required
          />
          {fieldErr("claimWindowDays")}
        </Field>
        <Field label="Internet limit (₹ a month)" htmlFor="internetMonthlyLimit">
          <input
            id="internetMonthlyLimit"
            name="internetMonthlyLimit"
            type="number"
            min={0}
            step={50}
            className="field tabular"
            defaultValue={rules.internetMonthlyLimit}
            required
          />
          {fieldErr("internetMonthlyLimit")}
        </Field>
        <Field label="Receipt needed above (₹)" htmlFor="receiptRequiredAbove" hint="0 means every claim needs one.">
          <input
            id="receiptRequiredAbove"
            name="receiptRequiredAbove"
            type="number"
            min={0}
            step={50}
            className="field tabular"
            defaultValue={rules.receiptRequiredAbove}
            required
          />
          {fieldErr("receiptRequiredAbove")}
        </Field>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Email</legend>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="emailNotifications" defaultChecked={rules.emailNotifications} className="mt-0.5 size-4 accent-[var(--teal)]" />
          <span>
            Email people about approvals, decisions, payslips and tickets
            <span className="text-ink-3 block text-xs">In-app notifications always stay on.</span>
          </span>
        </label>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-3 text-xs">If you change a number here, update the matching policy too. The HR assistant answers from the policy text.</p>
        <SubmitButton pendingLabel="Saving">Save rules</SubmitButton>
      </div>
    </ActionForm>
  );
}
