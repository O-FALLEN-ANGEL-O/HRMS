import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireUser, canRecruit } from "@/lib/auth";
import { Pill, StatusPill } from "@/components/ui";
import { Pipeline, JobControls } from "./board";

export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const user = await requireUser();
  const db = await getDb();
  const job = await db.query.jobs.findFirst({ where: eq(schema.jobs.id, jobId) });
  if (!job) notFound();
  if (!canRecruit(user) && job.hiringManagerId !== user.id) notFound();
  const [cands, dept] = await Promise.all([
    db.select().from(schema.candidates).where(eq(schema.candidates.jobId, jobId)).orderBy(desc(schema.candidates.matchScore)),
    job.departmentId ? db.query.departments.findFirst({ where: eq(schema.departments.id, job.departmentId) }) : null,
  ]);

  return (
    <div className="space-y-6">
      <nav className="text-ink-3 text-sm">
        <Link href="/recruitment" className="hover:text-ink">
          Recruitment
        </Link>{" "}
        / {job.title}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[70ch]">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl">{job.title}</h1>
            <StatusPill status={job.status} />
          </div>
          <p className="text-ink-2 mt-1">
            {dept?.name}, {job.location} ({job.workMode})
          </p>
          <details className="mt-3 text-sm">
            <summary className="text-sky cursor-pointer">Role and requirements</summary>
            <p className="text-ink-2 mt-2">{job.description}</p>
            <ul className="mt-2 list-disc space-y-0.5 pl-5">
              {job.requirements.split("\n").map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </details>
        </div>
        <JobControls jobId={job.id} status={job.status} />
      </div>
      <Pipeline
        jobId={job.id}
        candidates={cands.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          source: c.source,
          stage: c.stage,
          score: c.matchScore,
          summary: c.matchSummary,
          resume: c.resumeText,
          createdAt: c.createdAt,
        }))}
      />
      <p className="text-ink-3 text-xs">
        Match scores compare the resume to the requirements only. <Pill>AI</Pill> scores come from Workers AI; <Pill>Keywords</Pill> scores come from the
        built-in matcher when AI isn&apos;t available. Use them to prioritise reading, not to decide.
      </p>
    </div>
  );
}
