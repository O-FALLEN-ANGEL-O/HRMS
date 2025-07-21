
'use client';

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Briefcase, FileText, Send, User, MessageSquare, Star, Percent, Type, Clipboard, ShieldAlert, Award, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";


// Mock Data - In a real app, this would be fetched based on applicantId
const MOCK_APPLICANT = {
    id: 'app-001',
    name: 'Aarav Sharma',
    avatar: 'https://placehold.co/100x100?text=AS',
    roleApplied: 'Senior Frontend Developer',
    applicationDate: '2023-10-25',
    referral: 'Priya Mehta (EMP008)',
    resumeData: {
        skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'GraphQL', 'CI/CD'],
        workExperience: [
            { company: 'TechSolutions Inc.', title: 'Frontend Developer', dates: '2020-Present' },
            { company: 'WebInnovators LLC', title: 'Junior Developer', dates: '2018-2020' },
        ],
        education: [
            { institution: 'National Institute of Technology', degree: 'B.Tech in Computer Science', year: '2018' }
        ]
    },
    assessmentScores: [
        { name: 'Aptitude Test', score: 88, passing: 70, type: 'percent' },
        { name: 'Technical MCQ', score: 92, passing: 80, type: 'percent' },
        { name: 'Typing Test', score: 65, passing: 50, type: 'wpm' },
    ],
    interviewerNotes: [
        { id: 1, interviewer: 'Isabella Nguyen', role: 'Engineering Manager', note: 'Strong technical foundation in React and TypeScript. Good communication skills. Asked thoughtful questions about our architecture. Seems like a great culture fit.', timestamp: '2 days ago' },
        { id: 2, interviewer: 'Recruiter User', role: 'Talent Acquisition', note: 'Initial screening call went well. Candidate is enthusiastic and meets all the basic requirements. Moving to technical round.', timestamp: '5 days ago' }
    ]
}

type Note = typeof MOCK_APPLICANT.interviewerNotes[0];

function NoteCard({ note }: { note: Note }) {
    return (
        <div className="flex items-start gap-4">
            <Avatar className="h-9 w-9">
                <AvatarFallback>{note.interviewer.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{note.interviewer} <span className="text-xs text-muted-foreground font-normal">({note.role})</span></p>
                    <p className="text-xs text-muted-foreground">{note.timestamp}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{note.note}</p>
            </div>
        </div>
    )
}

function ScoreCard({ name, score, passing, type }: { name: string, score: number, passing: number, type: 'percent' | 'wpm' }) {
    const isPass = score >= passing;
    const Icon = type === 'wpm' ? Type : Percent;
    return (
         <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">{name}</p>
                <Badge variant={isPass ? "default" : "destructive"} className={isPass ? "bg-green-100 text-green-800" : ""}>
                    {isPass ? "Pass" : "Fail"}
                </Badge>
            </div>
            <p className="text-2xl font-bold font-headline mt-2">{score} <span className="text-lg text-muted-foreground font-sans">{type === 'wpm' ? "WPM" : "%"}</span></p>
            <p className="text-xs text-muted-foreground">Passing Score: {passing}{type === 'wpm' ? " WPM" : "%"}</p>
        </div>
    )
}

export default function ApplicantProfilePage() {
    const params = useParams();
    const applicantId = params.applicantId as string;
    const [notes, setNotes] = useState(MOCK_APPLICANT.interviewerNotes);
    const [newNote, setNewNote] = useState('');
    const { toast } = useToast();

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newNote.trim()) return;
        
        const noteToAdd: Note = {
            id: Date.now(),
            interviewer: 'Current User', // This would come from auth
            role: 'HR Manager',
            note: newNote,
            timestamp: 'Just now'
        }
        setNotes(prev => [noteToAdd, ...prev]);
        setNewNote('');
        toast({ title: 'Note Added', description: 'Your feedback has been saved.' });
    }

    return (
        <div className="space-y-6">
            <Alert variant="destructive" className="border-yellow-500/50 text-yellow-900 dark:text-yellow-200 [&>svg]:text-yellow-500">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle className="text-yellow-600 dark:text-yellow-300">Temporary Applicant Profile</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    This profile is for recruitment purposes only and will be automatically deleted 30 days after the position is closed.
                </AlertDescription>
            </Alert>
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary">
                            <AvatarImage src={MOCK_APPLICANT.avatar} data-ai-hint="person portrait" alt={MOCK_APPLICANT.name} />
                            <AvatarFallback>{MOCK_APPLICANT.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold font-headline">{MOCK_APPLICANT.name}</h1>
                            <div className="text-muted-foreground mt-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4"/>
                                    <span>Applied for: <strong>{MOCK_APPLICANT.roleApplied}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4"/>
                                    <span>Applied on: {MOCK_APPLICANT.applicationDate} (ID: {MOCK_APPLICANT.id})</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <User className="h-4 w-4"/>
                                    <span>Referred by: {MOCK_APPLICANT.referral}</span>
                                </div>
                            </div>
                        </div>
                         <div className="flex flex-col gap-2 w-full md:w-auto">
                            <Button>Schedule Interview</Button>
                            <Button variant="outline">Reject Application</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile & Assessments</TabsTrigger>
                    <TabsTrigger value="notes">Interviewer Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <div className="grid lg:grid-cols-3 gap-6 items-start">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileText /> AI-Parsed Resume Data</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-2">Key Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {MOCK_APPLICANT.resumeData.skills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-2">Work Experience</h4>
                                    <ul className="space-y-3">
                                        {MOCK_APPLICANT.resumeData.workExperience.map((exp, i) => (
                                            <li key={i} className="flex gap-3">
                                                <Briefcase className="h-4 w-4 mt-1 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{exp.title}</p>
                                                    <p className="text-sm text-muted-foreground">{exp.company} &middot; {exp.dates}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-2">Education</h4>
                                     <ul className="space-y-3">
                                        {MOCK_APPLICANT.resumeData.education.map((edu, i) => (
                                            <li key={i} className="flex gap-3">
                                                <Award className="h-4 w-4 mt-1 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{edu.degree}</p>
                                                    <p className="text-sm text-muted-foreground">{edu.institution} &middot; {edu.year}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Star /> Assessment Scores</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               {MOCK_APPLICANT.assessmentScores.map(score => (
                                <ScoreCard key={score.name} {...score} />
                               ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="notes">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MessageSquare /> Interviewer Notes</CardTitle>
                            <CardDescription>Feedback and comments from the hiring team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="flex items-start gap-4 mb-6" onSubmit={handleAddNote}>
                                <Textarea 
                                    placeholder="Add your feedback for this candidate..." 
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                />
                                <Button type="submit" size="icon"><Send className="h-4 w-4"/></Button>
                            </form>
                            <Separator className="mb-6"/>
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-6 pr-4">
                                {notes.map(note => <NoteCard key={note.id} note={note} />)}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
