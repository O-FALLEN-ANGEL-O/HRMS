"use client";

import { ActionForm, useActionForm } from "@/components/action-form";
import { setPasswordWithToken } from "../actions/auth";
import { PasswordField } from "../sign-in-form";
import { SubmitButton } from "@/components/ui";

export function SetPasswordForm({ token }: { token: string }) {
  const form = useActionForm(setPasswordWithToken);
  const state = form.state;
  const err = state && !state.ok ? state : null;
  return (
    <ActionForm form={form} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <PasswordField id="password" name="password" label="New password" autoComplete="new-password" error={err?.fieldErrors?.password} />
      <PasswordField id="confirm" name="confirm" label="Type it again" autoComplete="new-password" error={err?.fieldErrors?.confirm} />
      {err && !err.fieldErrors?.password && !err.fieldErrors?.confirm ? (
        <p className="bg-rose-soft text-rose rounded-lg px-3 py-2 text-sm" role="alert">
          {err.error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving">Save and sign in</SubmitButton>
      </div>
    </ActionForm>
  );
}
