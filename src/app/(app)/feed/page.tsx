import { Suspense } from "react";
import { desc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { Pin } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireUser, canPostAnnouncements } from "@/lib/auth";
import { Avatar, PageHeader, Panel, Pill } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import { GiveKudos, NewAnnouncement } from "./client";

export const metadata = { title: "Feed" };

const fromE = alias(schema.employees, "k_from");
const toE = alias(schema.employees, "k_to");

const VALUE_LABEL: Record<string, string> = { ownership: "Ownership", craft: "Craft", kindness: "Kindness", customers: "Customers" };

export default async function FeedPage() {
  const user = await requireUser();
  const db = await getDb();
  const [posts, kudos, people] = await Promise.all([
    db
      .select({ a: schema.announcements, name: schema.employees.name, hue: schema.employees.hue, title: schema.employees.title })
      .from(schema.announcements)
      .innerJoin(schema.employees, eq(schema.announcements.authorId, schema.employees.id))
      .orderBy(desc(schema.announcements.pinned), desc(schema.announcements.createdAt)),
    db
      .select({ k: schema.kudos, from: fromE.name, fromHue: fromE.hue, to: toE.name, toHue: toE.hue, toId: toE.id })
      .from(schema.kudos)
      .innerJoin(fromE, eq(schema.kudos.fromId, fromE.id))
      .innerJoin(toE, eq(schema.kudos.toId, toE.id))
      .orderBy(desc(schema.kudos.createdAt))
      .limit(30),
    db
      .select({ id: schema.employees.id, name: schema.employees.name })
      .from(schema.employees)
      .where(ne(schema.employees.status, "exited"))
      .orderBy(schema.employees.name),
  ]);

  const counts = new Map<string, { name: string; hue: number; n: number }>();
  for (const k of kudos) counts.set(k.toId, { name: k.to, hue: k.toHue, n: (counts.get(k.toId)?.n ?? 0) + 1 });

  return (
    <>
      <PageHeader
        title="Feed"
        description="Company news and thanks between colleagues."
        actions={
          <Suspense>
            <GiveKudos people={people.filter((p) => p.id !== user.id)} />
            {canPostAnnouncements(user) ? <NewAnnouncement canPin={user.role === "admin" || user.role === "hr"} /> : null}
          </Suspense>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-label="Announcements" className="space-y-4">
          {posts.map((p) => (
            <article key={p.a.id} className={`panel p-5 ${p.a.pinned ? "border-marigold/60" : ""}`}>
              <header className="mb-3 flex items-center gap-3">
                <Avatar name={p.name} hue={p.hue} size={36} />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-ink-3">
                    {p.title}, {timeAgo(p.a.createdAt)}
                  </p>
                </div>
                {p.a.pinned ? (
                  <Pill t="warn">
                    <Pin className="size-3" aria-hidden /> Pinned
                  </Pill>
                ) : null}
              </header>
              <h2 className="text-xl">{p.a.title}</h2>
              <p className="text-ink-2 mt-2 whitespace-pre-line">{p.a.body}</p>
            </article>
          ))}
        </section>
        <div className="space-y-6">
          <Panel title="Kudos" bodyClassName="p-0">
            <ul className="divide-line divide-y">
              {kudos.map((k) => (
                <li key={k.k.id} className="flex gap-3 px-5 py-3.5">
                  <Avatar name={k.to} hue={k.toHue} size={32} />
                  <div className="min-w-0 text-sm">
                    <p>
                      <span className="font-medium">{k.from.split(" ")[0]}</span> <span className="text-ink-3">to</span>{" "}
                      <span className="font-medium">{k.to}</span>
                    </p>
                    <p className="mt-0.5">{k.k.message}</p>
                    <p className="text-ink-3 mt-1 text-xs">
                      {VALUE_LABEL[k.k.value]}, {timeAgo(k.k.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Most thanked lately">
            <ol className="space-y-2.5">
              {[...counts.values()]
                .sort((a, b) => b.n - a.n)
                .slice(0, 5)
                .map((c, i) => (
                  <li key={c.name} className="flex items-center gap-3 text-sm">
                    <span className="text-ink-3 tabular w-4">{i + 1}</span>
                    <Avatar name={c.name} hue={c.hue} size={26} />
                    <span className="flex-1">{c.name}</span>
                    <span className="text-ink-2 tabular">{c.n}</span>
                  </li>
                ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}
