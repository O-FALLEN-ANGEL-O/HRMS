"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, UserPlus, MapPin, Users } from "lucide-react";
import { addEmployee } from "@/app/actions/people";
import { FormDialog } from "@/components/form-dialog";
import { Avatar, Button, EmptyState, Field, Pill, SubmitButton } from "@/components/ui";
import type { DirectoryRow } from "@/lib/queries";
import { addDays, cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = { admin: "Admin", hr: "HR", manager: "Manager", employee: "Employee", recruiter: "Recruiter" };

export function Directory({ people, departments }: { people: DirectoryRow[]; departments: { id: string; name: string; hue: number }[] }) {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const query = useDeferredValue(q.trim().toLowerCase());
  const filtered = useMemo(
    () =>
      people.filter(
        (p) =>
          (dept === "all" || p.departmentId === dept) &&
          (!query || [p.name, p.title, p.department, p.location, p.code].some((v) => v?.toLowerCase().includes(query))),
      ),
    [people, dept, query],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="text-ink-3 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
          <label htmlFor="people-q" className="sr-only">
            Search people
          </label>
          <input id="people-q" className="field pl-9" placeholder="Name, role, team or city" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by team">
          {[{ id: "all", name: "Everyone", hue: 0 }, ...departments].map((d) => (
            <button
              key={d.id}
              onClick={() => setDept(d.id)}
              aria-pressed={dept === d.id}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                dept === d.id ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-2 hover:border-line-strong",
              )}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>
      <p className="text-ink-3 text-sm" aria-live="polite">
        {filtered.length === people.length ? `${people.length} people` : `${filtered.length} of ${people.length} people`}
      </p>
      {filtered.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {filtered.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.16 }}
              >
                <Link
                  href={`/people/${p.id}`}
                  className="panel hover:border-line-strong flex h-full gap-3 p-4 transition-[border-color,box-shadow] hover:shadow-[var(--shadow)]"
                >
                  <Avatar name={p.name} hue={p.hue} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-ink-2 truncate text-sm">{p.title}</p>
                    <div className="text-ink-3 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full" style={{ background: `oklch(0.65 0.12 ${p.departmentHue ?? 220})` }} aria-hidden />
                        {p.department}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" aria-hidden /> {p.location}
                      </span>
                    </div>
                    {p.status !== "active" || p.role !== "employee" ? (
                      <div className="mt-2 flex gap-1.5">
                        {p.status !== "active" ? <Pill t="warn">{p.status === "onboarding" ? "Joining" : "Leaving"}</Pill> : null}
                        {p.role !== "employee" ? <Pill>{ROLE_LABEL[p.role]}</Pill> : null}
                      </div>
                    ) : null}
                  </div>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="panel">
          <EmptyState icon={<Users />} title="No one matches that">
            Try a first name, a job title like &ldquo;engineer&rdquo;, or clear the team filter.
          </EmptyState>
        </div>
      )}
    </div>
  );
}

export function AddEmployee({
  departments,
  managers,
  today,
}: {
  departments: { id: string; name: string }[];
  managers: { id: string; name: string }[];
  today: string;
}) {
  return (
    <FormDialog
      openParam="add"
      side="right"
      title="Add an employee"
      description="Creates their profile, salary structure and an onboarding checklist."
      action={addEmployee}
      trigger={
        <Button variant="accent">
          <UserPlus aria-hidden /> Add employee
        </Button>
      }
    >
      {() => (
        <>
          <Field label="Full name" htmlFor="name">
            <input id="name" name="name" className="field" required autoComplete="off" />
          </Field>
          <Field label="Work email" htmlFor="email">
            <input id="email" name="email" type="email" className="field" required placeholder="name@northwind-labs.example" autoComplete="off" />
          </Field>
          <Field label="Job title" htmlFor="title">
            <input id="title" name="title" className="field" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Team" htmlFor="departmentId">
              <select id="departmentId" name="departmentId" className="field" required>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reports to" htmlFor="managerId">
              <select id="managerId" name="managerId" className="field" required>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Access" htmlFor="role">
              <select id="role" name="role" className="field" defaultValue="employee">
                {Object.entries(ROLE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type" htmlFor="employmentType">
              <select id="employmentType" name="employmentType" className="field" defaultValue="full_time">
                <option value="full_time">Full-time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Joining date" htmlFor="joinedOn">
              <input id="joinedOn" name="joinedOn" type="date" className="field" required defaultValue={addDays(today, 14)} />
            </Field>
            <Field label="Location" htmlFor="location">
              <select id="location" name="location" className="field" defaultValue="Bengaluru">
                {["Bengaluru", "Mumbai", "Mangaluru", "Kolkata", "Remote"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Annual CTC (₹)" htmlFor="annualCtc" hint="Used to build their salary structure: basic, HRA, PF and so on.">
            <input
              id="annualCtc"
              name="annualCtc"
              type="number"
              inputMode="numeric"
              step={1000}
              min={100000}
              className="field tabular"
              required
              placeholder="1200000"
            />
          </Field>
          <div className="flex justify-end pt-2">
            <SubmitButton variant="accent" pendingLabel="Adding">
              Add employee
            </SubmitButton>
          </div>
        </>
      )}
    </FormDialog>
  );
}
