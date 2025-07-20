"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ListChecks, Percent } from "lucide-react";
import type { Assessment } from "@/lib/mock-data/assessments";
import { useParams } from 'next/navigation';

type AssessmentCardProps = {
  assessment: Assessment;
};

export function AssessmentCard({ assessment }: AssessmentCardProps) {
  const params = useParams();
  const role = params.role as string;
  const totalQuestions = assessment.sections.reduce((acc, section) => acc + section.questions.length, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{assessment.title}</CardTitle>
        <CardDescription>
          <Badge variant="outline">{assessment.process_type}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <span>{assessment.duration} minutes total</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <ListChecks className="mr-2 h-4 w-4" />
          <span>{totalQuestions} questions</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Percent className="mr-2 h-4 w-4" />
          <span>{assessment.passing_score}% passing score</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/${role}/assessments/${assessment.id}`} className="w-full">
            <Button className="w-full" disabled={totalQuestions === 0}>
                {totalQuestions > 0 ? 'Start Assessment' : 'Coming Soon'}
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
