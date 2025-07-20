"use client"

import React, { useState } from "react";
import Link from 'next/link';
import { PlusCircle, MoreVertical, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { scoreResume } from "@/ai/flows/score-resume";
import { suggestInterviewQuestions } from "@/ai/flows/suggest-interview-questions";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";

type Applicant = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired';
};

const initialApplicants: Applicant[] = [
  { id: '1', name: 'John Doe', avatar: 'https://placehold.co/100x100?text=JD', role: 'Software Engineer', status: 'Interview' },
  { id: '2', name: 'Jane Smith', avatar: 'https://placehold.co/100x100?text=JS', role: 'Product Manager', status: 'Applied' },
  { id: '3', name: 'Peter Jones', avatar: 'https://placehold.co/100x100?text=PJ', role: 'UX Designer', status: 'Screening' },
  { id: '4', name: 'Mary Johnson', avatar: 'https://placehold.co/100x100?text=MJ', role: 'Software Engineer', status: 'Offer' },
  { id: '5', name: 'David Williams', avatar: 'https://placehold.co/100x100?text=DW', role: 'Data Scientist', status: 'Hired' },
  { id: '6', name: 'Sarah Brown', avatar: 'https://placehold.co/100x100?text=SB', role: 'Software Engineer', status: 'Applied' },
];

const columns = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'] as const;

function ScoreResumeDialog({ applicant, jobDescription }: { applicant: Applicant; jobDescription: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<{ score: number; justification: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleScoreResume = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch the full resume text.
      const resumeText = `Resume for ${applicant.name}, applying for ${applicant.role}. Skills: React, Node.js, TypeScript. Experience: 5 years at TechCorp.`;
      const response = await scoreResume({ jd: jobDescription, resume: resumeText });
      setResult(response);
    } catch (error) {
      toast({ title: "Error scoring resume", description: "Could not score resume.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Bot className="mr-2 h-4 w-4" /> Score Resume
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Resume Score for {applicant.name}</DialogTitle>
          <DialogDescription>
            Scoring resume against the job description for a Software Engineer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {result ? (
            <div>
              <Label>Score: {result.score}/100</Label>
              <Progress value={result.score} className="w-full" />
              <p className="mt-4 text-sm text-muted-foreground">{result.justification}</p>
            </div>
          ) : (
            <p>Click below to use AI to score this candidate's resume against the job description.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} variant="outline">Cancel</Button>
          <Button onClick={handleScoreResume} disabled={loading}>
            {loading ? "Scoring..." : "Score with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SuggestQuestionsDialog({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestQuestions = async () => {
    setLoading(true);
    try {
      const response = await suggestInterviewQuestions({ role });
      setQuestions(response.questions);
    } catch (error) {
      toast({ title: "Error suggesting questions", description: "Could not fetch questions.", variant: "destructive" });
    }
    setLoading(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
       <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
          <Bot className="mr-2 h-4 w-4" /> Suggest Questions
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Suggested Interview Questions</DialogTitle>
          <DialogDescription>Role: {role}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[400px] overflow-y-auto">
          {loading && <p>Generating questions...</p>}
          {questions && (
            <ul className="space-y-2 list-disc pl-5">
              {questions.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} variant="outline">Close</Button>
          <Button onClick={handleSuggestQuestions} disabled={loading}>
            {loading ? "Generating..." : "Generate with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function KanbanCard({ applicant }: { applicant: Applicant }) {
    const jobDescription = "We are looking for a senior software engineer with 5+ years of experience in React and Node.js. The ideal candidate will have a strong understanding of TypeScript and cloud technologies like AWS or GCP."
  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={applicant.avatar} data-ai-hint="person avatar"/>
              <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{applicant.name}</p>
              <p className="text-sm text-muted-foreground">{applicant.role}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
              <DropdownMenuItem>
                <SuggestQuestionsDialog role={applicant.role} />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ScoreResumeDialog applicant={applicant} jobDescription={jobDescription} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}


function KanbanColumn({ title, applicants }: { title: typeof columns[number]; applicants: Applicant[] }) {
  return (
    <div className="w-[300px] flex-shrink-0">
      <Card className="bg-muted/50 h-full">
        <CardHeader className="p-4">
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              {title} <Badge variant="secondary">{applicants.length}</Badge>
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 h-[calc(100%-4rem)] overflow-y-auto">
          {applicants.map(applicant => (
            <KanbanCard key={applicant.id} applicant={applicant} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


export default function RecruitmentPage() {
  const [applicants] = useState<Applicant[]>(initialApplicants);
  const params = useParams();
  const role = params.role || 'admin';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Recruitment</h1>
          <p className="text-muted-foreground">Manage your hiring pipeline efficiently.</p>
        </div>
        <div className="flex gap-2">
            <Link href={`/${role}/recruitment/parse`}>
                <Button variant="outline">
                    <Bot className="mr-2 h-4 w-4" /> Parse Resume
                </Button>
            </Link>
            <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
            </Button>
        </div>
      </div>

      <div className="flex-grow flex flex-col">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Senior Software Engineer</CardTitle>
            <CardDescription>Applicants for the senior software engineer role.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {columns.map(column => (
                <KanbanColumn
                  key={column}
                  title={column}
                  applicants={applicants.filter(a => a.status === column)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
