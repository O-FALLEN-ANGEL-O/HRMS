import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireUser, isPeopleTeam } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { NewSurvey, SurveyCard } from "./client";

export const metadata = { title: "Surveys" };

export default async function SurveysPage() {
  const user = await requireUser();
  const db = await getDb();
  const [surveys, responses, headcount] = await Promise.all([
    db.select().from(schema.surveys).orderBy(desc(schema.surveys.createdAt)),
    db.select().from(schema.surveyResponses),
    db.$count(schema.employees, eq(schema.employees.status, "active")),
  ]);
  return (
    <>
      <PageHeader
        title="Surveys"
        description="Short, anonymous check-ins. Results show only totals, never who answered what."
        actions={
          isPeopleTeam(user) ? (
            <Suspense>
              <NewSurvey />
            </Suspense>
          ) : null
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {surveys.map((s) => {
          const rs = responses.filter((r) => r.surveyId === s.id);
          const mine = rs.find((r) => r.employeeId === user.id);
          return (
            <SurveyCard
              key={s.id}
              survey={{ id: s.id, title: s.title, question: s.question, kind: s.kind, status: s.status }}
              scores={rs.map((r) => r.score)}
              comments={isPeopleTeam(user) ? rs.filter((r) => r.comment).map((r) => r.comment!) : []}
              myScore={mine?.score ?? null}
              headcount={headcount}
              canManage={isPeopleTeam(user)}
            />
          );
        })}
      </div>
    </>
  );
}
