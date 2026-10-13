import Link from "next/link";
import { Suspense } from "react";
import { desc, eq, or } from "drizzle-orm";
import { LifeBuoy } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam } from "@/lib/auth";
import { Avatar, EmptyState, PageHeader, Pill, StatusPill } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import { NewTicket, TicketFilters } from "./client";

export const metadata = { title: "Helpdesk" };

export default async function HelpdeskPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const user = await requireUser();
  const { view = "open" } = await searchParams;
  const db = await getDb();
  const desk = isPeopleTeam(user);
  const rows = await db
    .select({ t: schema.tickets, name: schema.employees.name, hue: schema.employees.hue })
    .from(schema.tickets)
    .innerJoin(schema.employees, eq(schema.tickets.requesterId, schema.employees.id))
    .where(desk ? undefined : or(eq(schema.tickets.requesterId, user.id), eq(schema.tickets.assigneeId, user.id)))
    .orderBy(desc(schema.tickets.updatedAt));
  const shown = rows.filter((r) => (view === "all" ? true : view === "resolved" ? r.t.status === "resolved" : r.t.status !== "resolved"));
  const pri: Record<string, "bad" | "warn" | "neutral"> = { high: "bad", medium: "warn", low: "neutral" };

  return (
    <>
      <PageHeader
        title="Helpdesk"
        description={
          desk
            ? "Every ticket, sorted into IT, HR, Payroll and Facilities as it comes in."
            : "Ask IT, HR, Payroll or Facilities for help. Tickets are sorted and routed automatically."
        }
        actions={
          <Suspense>
            <NewTicket />
          </Suspense>
        }
      />
      <TicketFilters
        view={view}
        counts={{
          open: rows.filter((r) => r.t.status !== "resolved").length,
          resolved: rows.filter((r) => r.t.status === "resolved").length,
          all: rows.length,
        }}
      />
      <section className="panel mt-4 overflow-hidden">
        {shown.length ? (
          <ul className="divide-line divide-y">
            {shown.map(({ t, name, hue }) => (
              <li key={t.id}>
                <Link href={`/helpdesk/${t.id}`} className="hover:bg-surface-2 grid gap-2 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar name={name} hue={hue} size={32} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        <span className="text-ink-3 tabular mr-1.5">#{t.number}</span>
                        {t.subject}
                      </p>
                      <p className="text-ink-2 truncate text-sm">
                        {name}, updated {timeAgo(t.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pl-11 sm:pl-0">
                    <Pill t="info">{t.category}</Pill>
                    <Pill t={pri[t.priority]}>{t.priority}</Pill>
                    <StatusPill status={t.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<LifeBuoy />} title={view === "resolved" ? "Nothing resolved yet" : "No open tickets"}>
            {desk ? "New tickets appear here as soon as they're raised." : "Need something? Raise a ticket and it reaches the right team."}
          </EmptyState>
        )}
      </section>
    </>
  );
}
