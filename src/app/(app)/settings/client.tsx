"use client";

import { RotateCcw } from "lucide-react";
import { resetDemo, updatePolicy } from "@/app/actions/settings";
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
