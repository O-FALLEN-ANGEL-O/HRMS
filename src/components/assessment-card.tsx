
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ListChecks, Percent } from "lucide-react";
import type { Assessment } from "@/lib/mock-data/assessments";

type AssessmentCardProps = {
  assessment: Assessment;
};

const AssessmentCardComponent = ({ assessment }: AssessmentCardProps) => {
  const totalQuestions = assessment.sections.reduce((acc, section) => acc + section.questions.length, 0);

  return (
    <Card className="flex flex-col hover:border-primary transition-colors cursor-pointer w-full">
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
          <span>{assessment.passing_score}{assessment.passing_score_type === 'wpm' ? ' WPM' : '%'} passing score</span>
        </div>
      </CardContent>
    </Card>
  );
};

AssessmentCardComponent.displayName = 'AssessmentCard';
export const AssessmentCard = React.memo(AssessmentCardComponent);
