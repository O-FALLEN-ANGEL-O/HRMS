
"use client";

import { assessments } from "@/lib/mock-data/assessments";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit, Send, ClipboardCheck, User, BarChart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AssessmentCard } from "@/components/assessment-card";
import Link from "next/link";
import { useTeam } from "@/hooks/use-team";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { walkinApplicants } from "@/lib/mock-data/walkin";


function ManagerView() {
    const { toast } = useToast();
    const handleAction = (action: string) => {
        toast({
            title: "Action Triggered",
            description: `This is a mock action for "${action}".`,
        })
    }
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

function TraineeView() {
    const params = useParams();
    const role = params.role as string;
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
    );
}

function TrainerView() {
    const trainees = useTeam();
    const { toast } = useToast();

    // Mock scores by mapping trainee names to assessment attempts
    const traineeScores = walkinApplicants.reduce((acc, curr) => {
        acc[curr.fullName] = curr.assessments;
        return acc;
    }, {} as Record<string, any>);

    const getLatestScore = (traineeName: string, assessmentType: 'Typing' | 'Grammar') => {
        const assessmentIdPrefix = assessmentType === 'Typing' ? 'asmt-004' : 'asmt-001';
        const scores = traineeScores[traineeName];
        if (!scores) return { score: 'N/A', status: 'Pending' };

        const relevantAssessment = scores.find((a: any) => a.assessmentId.startsWith(assessmentIdPrefix));
        if (!relevantAssessment || relevantAssessment.attempts.length === 0) return { score: 'N/A', status: 'Pending' };
        
        const latestAttempt = relevantAssessment.attempts[relevantAssessment.attempts.length - 1];
        const score = latestAttempt.score !== null ? `${latestAttempt.score}%` : 'N/A';
        const status = relevantAssessment.status === 'Completed' ? 'Completed' : 'In Progress';
        return { score, status };
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Trainee Assessment Oversight</h1>
          <p className="text-muted-foreground">
            Monitor daily test results and simulation performance for your assigned trainees.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Daily Test Monitor</CardTitle>
            <CardDescription>Review of today's mandatory test completions and scores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Grammar Test</TableHead>
                  <TableHead>Typing Test</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map((trainee) => {
                  const grammar = getLatestScore(trainee.name, 'Grammar');
                  const typing = getLatestScore(trainee.name, 'Typing');
                  return (
                    <TableRow key={trainee.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-9 w-9">
                             <AvatarImage src={trainee.avatar} alt={trainee.name} data-ai-hint="person avatar" />
                             <AvatarFallback>{trainee.name.split(' ').map((n:string) => n[0]).join('')}</AvatarFallback>
                           </Avatar>
                           <div>
                            <p>{trainee.name}</p>
                            <p className="text-xs text-muted-foreground">{trainee.role}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={grammar.status === 'Completed' ? 'default' : 'secondary'} className={grammar.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {grammar.score}
                        </Badge>
                      </TableCell>
                       <TableCell>
                        <Badge variant={typing.status === 'Completed' ? 'default' : 'secondary'} className={typing.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                             {typing.score}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => toast({title: `Viewing details for ${trainee.name}`})}>View Details</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
}

export default function AssessmentsPage() {
  const params = useParams();
  const role = params.role as string;
  
  if (role === 'hr' || role === 'recruiter') {
    return <ManagerView />;
  }
  
  if (role === 'trainer') {
    return <TrainerView />;
  }

  return <TraineeView />;
}
