"use client";

import { ActionForm, useActionForm } from "@/components/action-form";
import Link from "next/link";
import { requestPasswordReset } from "../actions/auth";
import { SubmitButton } from "@/components/ui";

export function ForgotForm() {
  const form = useActionForm(requestPasswordReset);
  const state = form.state;
  if (state?.ok)
    return (
      <div className="space-y-4">
        <p className="bg-teal-soft text-teal rounded-lg px-3 py-2 text-sm" role="status">
          {state.message}
        </p>
        <Link href="/" className="link text-sm">
          Back to sign in
        </Link>
      </div>
    );
  return (
    <ActionForm form={form} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      {state && !state.ok ? (
        <p className="bg-rose-soft text-rose rounded-lg px-3 py-2 text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="link text-sm">
          Back to sign in
        </Link>
        <SubmitButton pendingLabel="Sending">Send reset link</SubmitButton>
      </div>
    </ActionForm>
  );
}
