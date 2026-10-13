import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam } from "@/lib/auth";
import { Avatar, Panel, Pill, StatusPill } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import { TicketSidebar } from "../client";
import { Reply } from "./reply";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const db = await getDb();
  const t = await db.query.tickets.findFirst({ where: eq(schema.tickets.id, id) });
  if (!t) notFound();
  const desk = isPeopleTeam(user);
  if (!desk && t.requesterId !== user.id && t.assigneeId !== user.id) notFound();
  const [requester, comments, staff] = await Promise.all([
    db.query.employees.findFirst({ where: eq(schema.employees.id, t.requesterId) }),
    db
      .select({ c: schema.ticketComments, name: schema.employees.name, hue: schema.employees.hue })
      .from(schema.ticketComments)
      .innerJoin(schema.employees, eq(schema.ticketComments.authorId, schema.employees.id))
      .where(eq(schema.ticketComments.ticketId, id))
      .orderBy(asc(schema.ticketComments.createdAt)),
    desk
      ? db
          .select({ id: schema.employees.id, name: schema.employees.name })
          .from(schema.employees)
          .where(inArray(schema.employees.role, ["admin", "hr"]))
      : [],
  ]);
  const people = desk
    ? [
        ...staff,
        ...(await db
          .select({ id: schema.employees.id, name: schema.employees.name })
          .from(schema.employees)
          .where(inArray(schema.employees.title, ["DevOps Engineer", "Payroll Specialist", "Facilities Manager"]))),
      ]
    : [];

  return (
    <div className="space-y-6">
      <nav className="text-ink-3 text-sm">
        <Link href="/helpdesk" className="hover:text-ink">
          Helpdesk
        </Link>{" "}
        / #{t.number}
      </nav>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl">{t.subject}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusPill status={t.status} />
              <Pill t="info">{t.category}</Pill>
              <Pill t={t.priority === "high" ? "bad" : t.priority === "medium" ? "warn" : "neutral"}>{t.priority} priority</Pill>
              <span className="text-ink-3 text-xs">
                {t.triagedBy === "ai" ? "Sorted by Workers AI" : t.triagedBy === "rules" ? "Sorted automatically" : "Sorted by the helpdesk"}
              </span>
            </div>
          </div>
          <ol className="space-y-4">
            <li className="panel p-4">
              <div className="mb-2 flex items-center gap-2.5 text-sm">
                <Avatar name={requester?.name ?? "?"} hue={requester?.hue ?? 200} size={28} />
                <span className="font-medium">{requester?.name}</span>
                <span className="text-ink-3">{timeAgo(t.createdAt)}</span>
              </div>
              <p className="whitespace-pre-line">{t.description}</p>
            </li>
            {comments.map(({ c, name, hue }) => (
              <li key={c.id} className={`panel p-4 ${c.authorId === t.requesterId ? "" : "border-l-sky border-l-4"}`}>
                <div className="mb-2 flex items-center gap-2.5 text-sm">
                  <Avatar name={name} hue={hue} size={28} />
                  <span className="font-medium">{name}</span>
                  <span className="text-ink-3">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="whitespace-pre-line">{c.body}</p>
              </li>
            ))}
          </ol>
          {t.status !== "resolved" || desk ? (
            <Reply ticketId={t.id} />
          ) : (
            <p className="text-ink-2 text-sm">This ticket is resolved. Raise a new one if the problem comes back.</p>
          )}
        </div>
        <aside>
          <Panel title={desk ? "Ticket" : "Your ticket"}>
            <TicketSidebar
              id={t.id}
              status={t.status}
              priority={t.priority}
              category={t.category}
              assigneeId={t.assigneeId}
              people={people}
              desk={desk}
              isRequester={t.requesterId === user.id}
            />
            {!desk ? (
              <p className="text-ink-2 mt-3 text-sm">{t.assigneeId ? "Someone from the team is on it." : "Waiting for someone from the team to pick it up."}</p>
            ) : null}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
