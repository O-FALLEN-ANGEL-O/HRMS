import { Suspense } from "react";
import { getDb, schema } from "@/db/client";
import { requireUser, canManagePeople } from "@/lib/auth";
import { directory } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { AddEmployee, Directory } from "./client";
import { todayIST } from "@/lib/utils";

export const metadata = { title: "People" };

export default async function PeoplePage() {
  const user = await requireUser();
  const db = await getDb();
  const [people, departments] = await Promise.all([directory(), db.select().from(schema.departments).orderBy(schema.departments.name)]);
  return (
    <>
      <PageHeader
        title="People"
        description={`${people.length} people across ${departments.length} teams at Northwind Labs.`}
        actions={
          canManagePeople(user) ? (
            <Suspense>
              <AddEmployee
                departments={departments}
                managers={people.filter((p) => ["admin", "hr", "manager"].includes(p.role)).map((p) => ({ id: p.id, name: p.name }))}
                today={todayIST()}
              />
            </Suspense>
          ) : null
        }
      />
      <Directory people={people} departments={departments.map((d) => ({ id: d.id, name: d.name, hue: d.hue }))} />
    </>
  );
}
