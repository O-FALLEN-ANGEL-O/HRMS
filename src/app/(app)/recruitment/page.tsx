import Link from "next/link";
import { Suspense } from "react";
import { eq, inArray } from "drizzle-orm";
import { Briefcase } from "lucide-react";
import { getDb, schema } from "@/db/client";
import { requireRole, canRecruit, isPeopleTeam } from "@/lib/auth";
import { EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { CANDIDATE_STAGES } from "@/db/schema";
import { timeAgo } from "@/lib/utils";
import { NewJob } from "./client";

export const metadata = { title: "Recruitment" };

const STAGE_COLOR: Record<string, string> = {
  applied: "var(--line-strong)",
  screening: "var(--sky)",
  interview: "var(--ink)",
  offer: "var(--marigold)",
  hired: "var(--teal)",
  rejected: "var(--rose)",
};

export default async function RecruitmentPage() {
  const user = await requireRole((u) => canRecruit(u) || u.role === "manager");
  const db = await getDb();
  const [allJobs, cands, departments, managers] = await Promise.all([
    db
      .select({ j: schema.jobs, dept: schema.departments.name, manager: schema.employees.name })
      .from(schema.jobs)
      .leftJoin(schema.departments, eq(schema.jobs.departmentId, schema.departments.id))
      .leftJoin(schema.employees, eq(schema.jobs.hiringManagerId, schema.employees.id))
      .orderBy(schema.jobs.status, schema.jobs.createdAt),
    db.select({ jobId: schema.candidates.jobId, stage: schema.candidates.stage, createdAt: schema.candidates.createdAt }).from(schema.candidates),
    db.select().from(schema.departments),
    db
      .select({ id: schema.employees.id, name: schema.employees.name })
      .from(schema.employees)
      .where(inArray(schema.employees.role, ["manager", "admin", "hr"])),
  ]);
  const jobs = canRecruit(user) ? allJobs : allJobs.filter((j) => j.j.hiringManagerId === user.id);

  return (
    <>
      <PageHeader
        title="Recruitment"
        description={
          canRecruit(user)
            ? "Open roles and where every candidate stands. New candidates get a resume match score when added."
            : "Roles you're the hiring manager for."
        }
        actions={
          canRecruit(user) ? (
            <Suspense>
              <NewJob departments={departments.map((d) => ({ id: d.id, name: d.name }))} managers={managers} />
            </Suspense>
          ) : null
        }
      />
      {jobs.length ? (
        <div className="panel divide-line divide-y">
          {jobs.map(({ j, dept, manager }) => {
            const mine = cands.filter((c) => c.jobId === j.id);
            const active = mine.filter((c) => c.stage !== "rejected");
            const fresh = mine.filter((c) => c.stage === "applied").length;
            return (
              <Link
                key={j.id}
                href={`/recruitment/${j.id}`}
                className="hover:bg-surface-2 grid gap-4 px-5 py-4 transition-colors md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display truncate text-lg font-semibold">{j.title}</p>
                    {j.status !== "open" ? <StatusPill status={j.status} /> : null}
                  </div>
                  <p className="text-ink-2 text-sm">
                    {dept}, {j.location} ({j.workMode}), {j.openings === 1 ? "1 opening" : `${j.openings} openings`}
                  </p>
                  <p className="text-ink-3 text-xs">
                    Hiring manager {manager}, opened {timeAgo(j.createdAt)}
                  </p>
                </div>
                <div>
                  <div className="bg-surface-2 flex h-2.5 overflow-hidden rounded-full" aria-hidden>
                    {CANDIDATE_STAGES.filter((s) => s !== "rejected").map((s) => {
                      const n = mine.filter((c) => c.stage === s).length;
                      return n ? <div key={s} style={{ width: `${(n / Math.max(1, active.length)) * 100}%`, background: STAGE_COLOR[s] }} /> : null;
                    })}
                  </div>
                  <p className="text-ink-2 mt-1.5 text-xs">
                    {CANDIDATE_STAGES.filter((s) => s !== "rejected")
                      .map((s) => `${mine.filter((c) => c.stage === s).length} ${s}`)
                      .join(", ")}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-display tabular text-2xl font-semibold">{active.length}</p>
                  <p className="text-ink-3">{fresh ? `${fresh} new` : "in pipeline"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="panel">
          <EmptyState icon={<Briefcase />} title={isPeopleTeam(user) || canRecruit(user) ? "No roles open" : "You're not hiring for any roles"}>
            {canRecruit(user) ? "Open a role to start adding candidates." : "When a recruiter opens a role with you as hiring manager, it shows up here."}
          </EmptyState>
        </div>
      )}
    </>
  );
}
