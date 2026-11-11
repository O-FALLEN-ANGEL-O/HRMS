"use client";

import { Plus } from "lucide-react";
import { submitExpense } from "@/app/actions/workday";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, SubmitButton } from "@/components/ui";
import { FileInput } from "@/components/file-input";
import { addDays, formatINR } from "@/lib/utils";

export function NewExpense({
  today,
  rules,
}: {
  today: string;
  rules: { claimWindowDays: number; internetMonthlyLimit: number; receiptRequiredAbove: number };
}) {
  return (
    <FormDialog
      openParam="new"
      title="File an expense"
      description="Your manager approves it; Finance pays it with the next payroll."
      action={submitExpense}
      trigger={
        <Button variant="accent">
          <Plus aria-hidden /> File an expense
        </Button>
      }
    >
      {({ fieldErrors }) => (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" htmlFor="category">
              <select id="category" name="category" className="field" required defaultValue="travel">
                <option value="travel">Travel</option>
                <option value="meals">Meals</option>
                <option value="internet">Internet (up to {formatINR(rules.internetMonthlyLimit)}/month)</option>
                <option value="equipment">Equipment (pre-approved)</option>
                <option value="learning">Learning</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Amount (₹)" htmlFor="amount">
              <input
                id="amount"
                name="amount"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                required
                className="field tabular"
                placeholder="0"
                aria-invalid={!!fieldErrors?.amount}
              />
            </Field>
          </div>
          <Field label="Date spent" htmlFor="spentOn">
            <input
              id="spentOn"
              name="spentOn"
              type="date"
              className="field"
              required
              defaultValue={today}
              max={today}
              min={addDays(today, -rules.claimWindowDays)}
            />
          </Field>
          <Field label="What was it for?" htmlFor="description">
            <textarea
              id="description"
              name="description"
              className="field min-h-20"
              required
              minLength={4}
              placeholder="e.g. Cab to the client office in Hebbal"
            />
          </Field>
          <Field
            label="Receipt"
            htmlFor="receipt"
            hint={rules.receiptRequiredAbove ? `Needed for claims over ${formatINR(rules.receiptRequiredAbove)}.` : "Needed for every claim."}
          >
            <FileInput id="receipt" name="receipt" label="Attach the bill (photo or PDF)" />
          </Field>
          <div className="flex justify-end">
            <SubmitButton variant="accent" pendingLabel="Filing">
              File expense
            </SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
