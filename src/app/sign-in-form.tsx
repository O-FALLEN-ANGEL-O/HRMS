"use client";

import { ActionForm, useActionForm } from "@/components/action-form";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPassword } from "./actions/auth";
import { SubmitButton } from "@/components/ui";
import { cn } from "@/lib/utils";

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  error,
  hint,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  error?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className={cn("field pr-10", error && "border-rose")}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-ink-3 hover:text-ink absolute inset-y-0 right-0 grid w-10 place-items-center"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-err`} className="text-rose mt-1 text-xs" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-ink-3 mt-1 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Email + password sign-in. In demo mode it also shows the shared demo password. */
export function SignInForm({ demoPassword, demoEmail }: { demoPassword?: string; demoEmail?: string }) {
  const form = useActionForm(signInWithPassword);
  const state = form.state;
  const err = state && !state.ok ? state : null;
  return (
    <ActionForm form={form} className="panel space-y-4 p-5" aria-labelledby="signin-title">
      <div>
        <h2 id="signin-title" className="text-xl">
          Sign in
        </h2>
        <p className="text-ink-2 text-sm">With your work email and HR+ password.</p>
      </div>
      <div>
        <label className="label" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={cn("field", err?.fieldErrors?.email && "border-rose")}
          defaultValue={demoEmail}
        />
      </div>
      <PasswordField id="password" name="password" label="Password" autoComplete="current-password" />
      {err ? (
        <p className="bg-rose-soft text-rose rounded-lg px-3 py-2 text-sm" role="alert">
          {err.error}
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <Link href="/forgot-password" className="link text-sm">
          Forgot password?
        </Link>
        <SubmitButton pendingLabel="Signing in">Sign in</SubmitButton>
      </div>
      {demoPassword ? (
        <p className="bg-surface-2 text-ink-2 rounded-lg px-3 py-2 text-xs">
          Demo: everyone at Northwind Labs uses the password <code className="text-ink font-mono">{demoPassword}</code>. Emails are first names, like{" "}
          <code className="text-ink font-mono">rohan@northwind-labs.example</code>.
        </p>
      ) : null}
    </ActionForm>
  );
}
