"use client";

import { Plus } from "lucide-react";
import { createJob } from "@/app/actions/recruitment";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, SubmitButton } from "@/components/ui";

export function NewJob({ departments, managers }: { departments: { id: string; name: string }[]; managers: { id: string; name: string }[] }) {
  return (
    <FormDialog
      side="right"
      title="Open a role"
      description="Requirements are used to score every candidate's resume, so list them one per line."
      action={createJob}
      trigger={
        <Button variant="accent">
          <Plus aria-hidden /> Open a role
        </Button>
      }
    >
      {() => (
        <>
          <Field label="Job title" htmlFor="title">
            <input id="title" name="title" className="field" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Team" htmlFor="departmentId">
              <select id="departmentId" name="departmentId" className="field">
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hiring manager" htmlFor="hiringManagerId">
              <select id="hiringManagerId" name="hiringManagerId" className="field">
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Location" htmlFor="location">
              <input id="location" name="location" className="field" defaultValue="Bengaluru" required />
            </Field>
            <Field label="Mode" htmlFor="workMode">
              <select id="workMode" name="workMode" className="field" defaultValue="hybrid">
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </Field>
            <Field label="Openings" htmlFor="openings">
              <input id="openings" name="openings" type="number" min={1} max={50} defaultValue={1} className="field" />
            </Field>
          </div>
          <Field label="About the role" htmlFor="description">
            <textarea id="description" name="description" className="field min-h-24" required minLength={20} />
          </Field>
          <Field label="Requirements" htmlFor="requirements" hint="One per line. Start optional ones with “Nice to have”.">
            <textarea
              id="requirements"
              name="requirements"
              className="field min-h-32"
              required
              minLength={10}
              placeholder={"3+ years with React and TypeScript\nExperience shipping accessible UI\nNice to have: design systems"}
            />
          </Field>
          <div className="flex justify-end">
            <SubmitButton variant="accent" pendingLabel="Opening">
              Open role
            </SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
