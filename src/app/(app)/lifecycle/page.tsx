import Link from "next/link";
import { and, eq, inArray } from "drizzle-orm";
import { DoorOpen } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireRole, isPeopleTeam } from "@/lib/auth";
import { Avatar, EmptyState, PageHeader, Pill } from "@/components/ui";
import { daysBetween, formatDate, plural, todayIST } from "@/lib/utils";
import { Checklist } from "./client";

export const metadata = { title: "Joiners & leavers" };

export default async function LifecyclePage() {
  const user = await requireRole((u) => isPeopleTeam(u) || u.role === "manager");
  const db = await getDb();
  const today = todayIST();
  const people = await db
    .select()
    .from(schema.employees)
    .where(and(inArray(schema.employees.status, ["onboarding", "offboarding"]), isPeopleTeam(user) ? undefined : eq(schema.employees.managerId, user.id)));
  const tasks = people.length
    ? await db
        .select()
        .from(schema.lifecycleTasks)
        .where(
          inArray(
            schema.lifecycleTasks.employeeId,
            people.map((p) => p.id),
          ),
        )
        .orderBy(schema.lifecycleTasks.sort)
    : [];

  const card = (p: (typeof people)[number]) => {
    const kind = p.status === "onboarding" ? "onboarding" : "offboarding";
    const list = tasks.filter((t) => t.employeeId === p.id && t.kind === kind);
    const keyDate = kind === "onboarding" ? p.joinedOn : p.exitOn!;
    const delta = daysBetween(today, keyDate);
    return (
      <article key={p.id} className="panel overflow-hidden">
        <header className="border-line flex items-center gap-3 border-b px-5 py-4">
          <Avatar name={p.name} hue={p.hue} size={40} />
          <div className="min-w-0 flex-1">
            <Link href={`/people/${p.id}`} className="font-medium hover:underline">
              {p.name}
            </Link>
            <p className="text-ink-2 text-sm">{p.title}</p>
          </div>
          <div className="text-right">
            <Pill t={kind === "onboarding" ? "info" : "warn"}>
              {kind === "onboarding"
                ? delta > 0
                  ? `Joins in ${plural(delta, "day")}`
                  : delta === 0
                    ? "Joins today"
                    : `Joined ${plural(-delta, "day")} ago`
                : delta > 0
                  ? `Leaves in ${plural(delta, "day")}`
                  : "Last day today"}
            </Pill>
            <p className="text-ink-3 mt-1 text-xs">{formatDate(keyDate, { day: "numeric", month: "long" })}</p>
          </div>
        </header>
        <Checklist
          tasks={list.map((t) => ({ id: t.id, title: t.title, owner: t.ownerRole, dueOn: t.dueOn, done: !!t.doneAt }))}
          today={today}
          myRole={user.role}
          isManager={p.managerId === user.id}
          isPeople={isPeopleTeam(user)}
        />
      </article>
    );
  };

  const joining = people.filter((p) => p.status === "onboarding");
  const leaving = people.filter((p) => p.status === "offboarding");

  return (
    <>
      <PageHeader
        title="Joiners & leavers"
        description="Checklists are created automatically when someone is added or their exit starts. When every step is done, their status updates by itself."
      />
      {people.length === 0 ? (
        <div className="panel">
          <EmptyState icon={<DoorOpen />} title="No one joining or leaving right now">
            {isPeopleTeam(user) ? "Add an employee from People to start an onboarding checklist." : "New joiners on your team will show up here."}
          </EmptyState>
        </div>
      ) : (
        <div className="space-y-8">
          {joining.length ? (
            <section aria-labelledby="joining">
              <h2 id="joining" className="mb-3 text-xl">
                Joining
              </h2>
              <div className="grid gap-5 lg:grid-cols-2">{joining.map(card)}</div>
            </section>
          ) : null}
          {leaving.length ? (
            <section aria-labelledby="leaving">
              <h2 id="leaving" className="mb-3 text-xl">
                Leaving
              </h2>
              <div className="grid gap-5 lg:grid-cols-2">{leaving.map(card)}</div>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
