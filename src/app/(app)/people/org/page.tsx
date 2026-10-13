import { requireUser } from "@/lib/auth";
import { directory } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { OrgTree } from "./tree";

export const metadata = { title: "Org chart" };

export default async function OrgPage() {
  const user = await requireUser();
  const people = await directory();
  return (
    <>
      <PageHeader title="Org chart" description="Who reports to whom. Open or close a branch to focus on one team." />
      <OrgTree
        people={people.map((p) => ({
          id: p.id,
          name: p.name,
          title: p.title,
          hue: p.hue,
          managerId: p.managerId,
          department: p.department ?? "",
          departmentHue: p.departmentHue ?? 220,
          status: p.status,
        }))}
        meId={user.id}
      />
    </>
  );
}
