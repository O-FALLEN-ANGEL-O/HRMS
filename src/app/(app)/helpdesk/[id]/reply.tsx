"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { commentOnTicket } from "@/app/actions/support";
import { SubmitButton } from "@/components/ui";

export function Reply({ ticketId }: { ticketId: string }) {
  const [state, action] = useActionState(commentOnTicket, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) ref.current?.reset();
    else toast.error(state.error);
  }, [state]);
  return (
    <form ref={ref} action={action} className="panel p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <label htmlFor="reply" className="label">
        Reply
      </label>
      <textarea id="reply" name="body" className="field min-h-24" required />
      <div className="mt-3 flex justify-end">
        <SubmitButton pendingLabel="Sending">Send reply</SubmitButton>
      </div>
    </form>
  );
}
