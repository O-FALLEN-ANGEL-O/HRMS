"use client";

import { AssessmentCard } from "@/components/assessment-card";
import { assessments } from "@/lib/mock-data/assessments";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";


export default function AssessmentsPage() {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return (
       <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">Assessment Management</h1>
            <p className="text-muted-foreground">
              Create, assign, and review assessments for all roles.
            </p>
          </div>
           <Card>
            <CardHeader>
                <CardTitle>Admin View</CardTitle>
                <CardDescription>This area is for managing assessments. Feature coming soon.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">The admin dashboard for creating and reviewing assessments is under construction.</p>
            </CardContent>
           </Card>
        </div>
    )
  }

  // Employee View
  if (assessments.length === 0) {
    return (
       <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">My Assessments</h1>
            <p className="text-muted-foreground">
              Complete your assigned assessments to proceed with your application or performance review.
            </p>
          </div>
          <Card className="mt-10">
            <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground"/>
                    <h3 className="text-xl font-semibold">No Assessments Assigned</h3>
                    <p className="text-muted-foreground">You currently have no pending assessments. Please check back later.</p>
                </div>
            </CardContent>
          </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Assessments</h1>
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
