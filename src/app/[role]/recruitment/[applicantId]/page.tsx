
'use client';

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Briefcase, FileText, Send, User, MessageSquare, Award, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState, memo, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StandardAssessmentsTab } from "@/components/standard-assessments-tab";


// Mock Data - In a real app, this would be fetched based on applicantId
const MOCK_APPLICANT_BASE = {
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
    interviewerNotes: [
        { id: 1, interviewer: 'Isabella Nguyen', role: 'Engineering Manager', note: 'Strong technical foundation in React and TypeScript. Good communication skills. Asked thoughtful questions about our architecture. Seems like a great culture fit.', timestamp: '2 days ago' },
        { id: 2, interviewer: 'Recruiter User', role: 'Talent Acquisition', note: 'Initial screening call went well. Candidate is enthusiastic and meets all the basic requirements. Moving to technical round.', timestamp: '5 days ago' }
    ]
}

type Note = typeof MOCK_APPLICANT_BASE.interviewerNotes[0];

const NoteCard = memo(function NoteCard({ note }: { note: Note }) {
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
});


export default function ApplicantProfilePage() {
    const params = useParams();
    const applicantId = params.applicantId as string;
    const [notes, setNotes] = useState(MOCK_APPLICANT_BASE.interviewerNotes);
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
                <FileText className="h-4 w-4" />
                <AlertTitle className="text-yellow-600 dark:text-yellow-300">Temporary Applicant Profile</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    This profile is for recruitment purposes only and will be automatically deleted 30 days after the position is closed.
                </AlertDescription>
            </Alert>
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary">
                            <AvatarImage src={MOCK_APPLICANT_BASE.avatar} data-ai-hint="person portrait" alt={MOCK_APPLICANT_BASE.name} />
                            <AvatarFallback>{MOCK_APPLICANT_BASE.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold font-headline">{MOCK_APPLICANT_BASE.name}</h1>
                            <div className="text-muted-foreground mt-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4"/>
                                    <span>Applied for: <strong>{MOCK_APPLICANT_BASE.roleApplied}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4"/>
                                    <span>Applied on: {MOCK_APPLICANT_BASE.applicationDate} (ID: {applicantId})</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <User className="h-4 w-4"/>
                                    <span>Referred by: {MOCK_APPLICANT_BASE.referral}</span>
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
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                    <TabsTrigger value="profile">Profile & Resume</TabsTrigger>
                    <TabsTrigger value="notes">Interviewer Notes</TabsTrigger>
                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText /> AI-Parsed Resume Data</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2">Key Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {MOCK_APPLICANT_BASE.resumeData.skills.map(skill => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold mb-2">Work Experience</h4>
                                <ul className="space-y-3">
                                    {MOCK_APPLICANT_BASE.resumeData.workExperience.map((exp, i) => (
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
                                    {MOCK_APPLICANT_BASE.resumeData.education.map((edu, i) => (
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
                <TabsContent value="assessments">
                     <StandardAssessmentsTab applicantId={applicantId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
