"use client";

import { createContext, startTransition, useActionState, useContext } from "react";

/**
 * React resets an uncontrolled form after every action, which wipes what the
 * person typed when the server says no. ActionForm submits through the same
 * action without that reset (successful forms reset themselves where they
 * want to). The real `action` stays on the element, so a submit before the
 * page finishes loading still posts normally.
 */
const PendingContext = createContext(false);
export const useActionFormPending = () => useContext(PendingContext);

type Action<S> = (prev: S | null, fd: FormData) => Promise<S>;

export function useActionForm<S>(action: Action<S>) {
  const [state, dispatch, pending] = useActionState(action, null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(fd));
  };
  return { state, dispatch, pending, onSubmit };
}

export function ActionForm({
  form,
  ...props
}: Omit<React.FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & {
  form: { dispatch: (fd: FormData) => void; pending: boolean; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void };
  ref?: React.Ref<HTMLFormElement>;
}) {
  return (
    <PendingContext.Provider value={form.pending}>
      <form action={form.dispatch} onSubmit={form.onSubmit} {...props} />
    </PendingContext.Provider>
  );
}
