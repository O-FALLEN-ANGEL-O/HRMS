"use client";

import { Pencil, DoorOpen } from "lucide-react";
import { startOffboarding, updateEmployee } from "@/app/actions/people";
import { FormDialog } from "@/components/form-dialog";
import { Button, Field, SubmitButton } from "@/components/ui";
import { addDays } from "@/lib/utils";

type Emp = {
  id: string;
  title: string;
  departmentId: string | null;
  managerId: string | null;
  role: string;
  location: string;
  phone: string | null;
  bio: string | null;
  skills: string | null;
};

export function EditProfile({
  emp,
  hr,
  departments,
  people,
}: {
  emp: Emp;
  hr: boolean;
  departments: { id: string; name: string }[];
  people: { id: string; name: string }[];
}) {
  return (
    <FormDialog
      side="right"
      title={hr ? "Edit employee" : "Edit your profile"}
      action={updateEmployee}
      trigger={
        <Button variant="outline">
          <Pencil aria-hidden /> Edit
        </Button>
      }
    >
      {() => (
        <>
          <input type="hidden" name="id" value={emp.id} />
          {hr ? (
            <>
              <Field label="Job title" htmlFor="title">
                <input id="title" name="title" className="field" defaultValue={emp.title} required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Team" htmlFor="departmentId">
                  <select id="departmentId" name="departmentId" className="field" defaultValue={emp.departmentId ?? ""}>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reports to" htmlFor="managerId">
                  <select id="managerId" name="managerId" className="field" defaultValue={emp.managerId ?? ""}>
                    <option value="">No manager</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Access" htmlFor="role">
                  <select id="role" name="role" className="field" defaultValue={emp.role}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label="Location" htmlFor="location">
                  <input id="location" name="location" className="field" defaultValue={emp.location} />
                </Field>
              </div>
            </>
          ) : null}
          <Field label="Phone" htmlFor="phone">
            <input id="phone" name="phone" type="tel" className="field" defaultValue={emp.phone ?? ""} />
          </Field>
          <Field label="About" htmlFor="bio" hint="A line or two your colleagues will see.">
            <textarea id="bio" name="bio" className="field min-h-20" defaultValue={emp.bio ?? ""} maxLength={400} />
          </Field>
          <Field label="Skills" htmlFor="skills" hint="Separate with commas.">
            <input id="skills" name="skills" className="field" defaultValue={emp.skills ?? ""} />
          </Field>
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Saving">Save changes</SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}

export function Offboard({ id, name, today }: { id: string; name: string; today: string }) {
  return (
    <FormDialog
      title={`Start ${name.split(" ")[0]}'s exit`}
      description="Sets their last working day and creates the exit checklist: handover, exit interview, asset return, access removal and settlement."
      action={startOffboarding}
      trigger={
        <Button variant="danger">
          <DoorOpen aria-hidden /> Start exit
        </Button>
      }
    >
      {() => (
        <>
          <input type="hidden" name="id" value={id} />
          <Field label="Last working day" htmlFor="exitOn" hint="Default notice period is 60 days.">
            <input id="exitOn" name="exitOn" type="date" className="field" required defaultValue={addDays(today, 60)} min={today} />
          </Field>
          <Field label="Reason (private)" htmlFor="reason">
            <select id="reason" name="reason" className="field" defaultValue="Resigned">
              <option>Resigned</option>
              <option>End of contract</option>
              <option>Internship completed</option>
              <option>Other</option>
            </select>
          </Field>
          <div className="flex justify-end">
            <SubmitButton variant="danger" pendingLabel="Starting">
              Start exit
            </SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
