"use client";

import { Heart, Megaphone } from "lucide-react";
import { giveKudos, postAnnouncement } from "@/app/actions/people";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, SubmitButton } from "@/components/ui";

export function GiveKudos({ people }: { people: { id: string; name: string }[] }) {
  return (
    <FormDialog
      openParam="kudos"
      title="Give kudos"
      description="Say thanks for something specific. They'll get a notification."
      action={giveKudos}
      trigger={
        <Button variant="outline">
          <Heart aria-hidden /> Give kudos
        </Button>
      }
    >
      {() => (
        <>
          <Field label="To" htmlFor="toId">
            <select id="toId" name="toId" className="field" required defaultValue="">
              <option value="" disabled>
                Choose a colleague
              </option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <fieldset>
            <legend className="label">For</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["ownership", "Ownership"],
                ["craft", "Craft"],
                ["kindness", "Kindness"],
                ["customers", "Customers"],
              ].map(([v, l], i) => (
                <label
                  key={v}
                  className="border-line has-[:checked]:border-ink has-[:checked]:bg-surface-2 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <input type="radio" name="value" value={v} defaultChecked={i === 0} className="accent-[var(--ink)]" />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="What did they do?" htmlFor="message">
            <textarea
              id="message"
              name="message"
              className="field min-h-24"
              required
              minLength={8}
              maxLength={280}
              placeholder="Be specific — it means more."
            />
          </Field>
          <div className="flex justify-end">
            <SubmitButton variant="accent" pendingLabel="Sending">
              Send kudos
            </SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}

export function NewAnnouncement({ canPin }: { canPin: boolean }) {
  return (
    <FormDialog
      title="Post an announcement"
      action={postAnnouncement}
      trigger={
        <Button variant="primary">
          <Megaphone aria-hidden /> Post announcement
        </Button>
      }
    >
      {() => (
        <>
          <Field label="Title" htmlFor="title">
            <input id="title" name="title" className="field" required minLength={4} maxLength={120} />
          </Field>
          <Field label="Message" htmlFor="body">
            <textarea id="body" name="body" className="field min-h-32" required minLength={10} />
          </Field>
          {canPin ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="pinned" className="size-4 accent-[var(--ink)]" /> Pin to the top of everyone&apos;s home page
            </label>
          ) : null}
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Posting">Post</SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
