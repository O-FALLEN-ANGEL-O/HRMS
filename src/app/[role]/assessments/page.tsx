"use client";

import { AssessmentCard } from "@/components/assessment-card";
import { assessments } from "@/lib/mock-data/assessments";

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Assessments</h1>
        <p className="text-muted-foreground">
          Complete your assigned assessments to proceed with your application or performance review.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
        ))}
      </div>
    </div>
  );
}
