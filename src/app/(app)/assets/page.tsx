import Link from "next/link";
import { Suspense } from "react";
import { eq, ne } from "drizzle-orm";
import { Laptop } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireUser, canManageAssets } from "@/lib/auth";
import { Button, EmptyState, PageHeader, Panel, Stat } from "@/components/ui";
import { formatDate, formatINR } from "@/lib/utils";
import { AddAsset, Inventory } from "./client";

export const metadata = { title: "Assets" };

export default async function AssetsPage() {
  const user = await requireUser();
  const db = await getDb();

  if (!canManageAssets(user)) {
    const mine = await db.select().from(schema.assets).where(eq(schema.assets.assignedTo, user.id));
    return (
      <>
        <PageHeader
          title="Your equipment"
          description="Things the company has lent you. Something broken? Raise a helpdesk ticket."
          actions={
            <Button asChild variant="outline">
              <Link href="/helpdesk?new=1">Report a problem</Link>
            </Button>
          }
        />
        <Panel bodyClassName="p-0">
          {mine.length ? (
            <ul className="divide-line divide-y">
              {mine.map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="bg-surface-2 text-ink-2 grid size-10 place-items-center rounded-[10px]">
                    <Laptop className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-ink-2 text-sm">
                      {a.tag}
                      {a.serial ? `, serial ${a.serial}` : ""}
                    </p>
                  </div>
                  <p className="text-ink-3 text-sm">Since {formatDate(a.assignedOn, { day: "numeric", month: "short", year: "numeric" })}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Laptop />} title="Nothing assigned to you">
              If you&apos;re waiting on a laptop or monitor, raise a helpdesk ticket.
            </EmptyState>
          )}
        </Panel>
      </>
    );
  }

  const [items, people] = await Promise.all([
    db
      .select({ a: schema.assets, holder: schema.employees.name, holderHue: schema.employees.hue })
      .from(schema.assets)
      .leftJoin(schema.employees, eq(schema.assets.assignedTo, schema.employees.id))
      .orderBy(schema.assets.tag),
    db
      .select({ id: schema.employees.id, name: schema.employees.name })
      .from(schema.employees)
      .where(ne(schema.employees.status, "exited"))
      .orderBy(schema.employees.name),
  ]);
  const count = (s: string) => items.filter((i) => i.a.status === s).length;
  const value = items.filter((i) => i.a.status !== "retired").reduce((a, i) => a + i.a.cost, 0);

  return (
    <>
      <PageHeader
        title="Assets"
        description="Laptops, monitors and everything else the company owns, and who has it."
        actions={
          <Suspense>
            <AddAsset />
          </Suspense>
        }
      />
      <section className="panel bg-line mb-6 grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4" aria-label="Summary">
        {[
          { label: "Assigned", value: count("assigned") },
          { label: "Available", value: count("available") },
          { label: "In repair", value: count("repair") },
          { label: "Value in use", value: formatINR(value) },
        ].map((s) => (
          <div key={s.label} className="bg-surface px-4 py-4">
            <Stat {...s} />
          </div>
        ))}
      </section>
      <Inventory items={items.map((i) => ({ ...i.a, holder: i.holder, holderHue: i.holderHue }))} people={people} />
    </>
  );
}
