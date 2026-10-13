"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "./ui";

type Result = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> } | null;

/**
 * A dialog wrapping a form bound to a server action `(prev, formData) => Result`.
 * Closes and toasts on success; shows the error inline otherwise.
 * `openParam` opens it when the URL has ?new=1 (used by the command palette).
 */
export function FormDialog({
  trigger,
  title,
  description,
  action,
  children,
  openParam,
  side,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  action: (prev: unknown, fd: FormData) => Promise<Result>;
  children: (state: { fieldErrors?: Record<string, string> }) => React.ReactNode;
  openParam?: string;
  side?: "right";
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<Result>(null);

  useEffect(() => {
    if (openParam && params.get(openParam)) {
      setOpen(true);
      router.replace(pathname, { scroll: false });
    }
  }, [openParam, params, router, pathname]);

  useEffect(() => {
    if (!state || handled.current === state) return;
    handled.current = state;
    if (state.ok) {
      toast.success(state.message ?? "Saved.");
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title} description={description} side={side}>
        <form ref={formRef} action={formAction} className="space-y-4" noValidate={false}>
          {children({ fieldErrors: state && !state.ok ? state.fieldErrors : undefined })}
          {state && !state.ok ? (
            <p role="alert" className="rounded-lg bg-rose-soft px-3 py-2 text-sm text-rose">
              {state.error}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
