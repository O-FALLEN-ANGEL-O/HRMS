
"use client";

import { assessments } from "@/lib/mock-data/assessments";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertTriangle, PlusCircle, Edit, Send, ClipboardCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AssessmentCard } from "@/components/assessment-card";
import Link from "next/link";


export default function AssessmentsPage() {
  const params = useParams();
  const { toast } = useToast();
  const role = params.role as string;
  const router = useRouter();
  
  const canManageAssessments = role === 'hr' || role === 'recruiter';

  const handleAction = (action: string) => {
    toast({
        title: "Action Triggered",
        description: `This is a mock action for "${action}".`,
    })
  }

  // View for HR/Recruiter to manage assessments
  if (canManageAssessments) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Assessment Management</h1>
          <p className="text-muted-foreground">
            Create, assign, and review assessments for all roles.
          </p>
        </div>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle>Available Assessments</CardTitle>
                  <CardDescription>A list of all tests available to be assigned to candidates.</CardDescription>
              </div>
              <Button onClick={() => handleAction('Create Assessment')}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Assessment
              </Button>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Process Type</TableHead>
                          <TableHead className="text-center">Questions</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {assessments.map((assessment) => (
                          <TableRow key={assessment.id}>
                              <TableCell className="font-medium">{assessment.title}</TableCell>
                              <TableCell><Badge variant="outline">{assessment.process_type}</Badge></TableCell>
                              <TableCell className="text-center">
                                  {assessment.sections.reduce((acc, section) => acc + section.questions.length, 0)}
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleAction('Assign Assessment')}>
                                      <Send className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleAction('Edit Assessment')}>
                                      <Edit className="h-4 w-4" />
                                  </Button>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
         </Card>
      </div>
    )
  }

  // View for Employee/Trainee to take assessments
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Assessments</h1>
        <p className="text-muted-foreground">
          Complete your assigned daily and weekly assessments.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assessments.map(assessment => (
          <Link key={assessment.id} href={`/${role}/assessments/${assessment.id}`} className="flex">
            <AssessmentCard assessment={assessment} />
          </Link>
        ))}
        {assessments.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <ClipboardCheck className="h-12 w-12 text-muted-foreground"/>
                    <h3 className="text-xl font-semibold">No Assessments Assigned</h3>
                    <p className="text-muted-foreground">You have no pending assessments at this time. Great job!</p>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
