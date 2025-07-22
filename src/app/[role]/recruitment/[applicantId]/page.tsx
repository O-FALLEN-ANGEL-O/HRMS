
'use client';

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Briefcase, FileText, Send, User, MessageSquare, Star, Percent, Type, Clipboard, ShieldAlert, Award, Calendar, Puzzle, Check, X, PlusCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState, memo, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { walkinApplicants } from "@/lib/mock-data/walkin";
import { assessments, type Assessment } from "@/lib/mock-data/assessments";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


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


const AssessmentsTab = ({ applicantId }: { applicantId: string }) => {
    const { toast } = useToast();
    // This state would normally be fetched and updated via API calls
    const [applicant, setApplicant] = useState(() => walkinApplicants.find(a => a.id === applicantId));
    const [selectedScores, setSelectedScores] = useState<Record<string, number>>({});


    if (!applicant) {
        // If the applicant is not from a walk-in, we simulate a different structure
         return <Card><CardContent><p className="p-4 text-muted-foreground">No assessment data for this applicant type.</p></CardContent></Card>
    }

    const handleAssignTest = (assessmentId: string) => {
        if (!assessmentId) return;

        const alreadyAssigned = applicant.assessments.some(a => a.assessmentId === assessmentId);
        if (alreadyAssigned) {
            toast({ title: 'Already Assigned', description: 'This assessment is already assigned to the applicant.', variant: 'destructive' });
            return;
        }

        const newAssessment = {
            assessmentId,
            status: 'Not Started' as const,
            attempts: [],
        };
        
        const updatedApplicant = { ...applicant, assessments: [...applicant.assessments, newAssessment] };
        // In a real app, this would be an API call
        // For mock: find and update in walkinApplicants array
        const index = walkinApplicants.findIndex(a => a.id === applicantId);
        if (index > -1) {
            walkinApplicants[index] = updatedApplicant;
        }
        setApplicant(updatedApplicant);
        toast({ title: 'Assessment Assigned', description: 'The new assessment has been assigned to the applicant.' });
    };

    const handleApproval = (assessmentId: string, approve: boolean) => {
        const updatedAssessments = applicant.assessments.map(appAssessment => {
            if (appAssessment.assessmentId === assessmentId && appAssessment.retryRequest?.status === 'Pending') {
                return {
                    ...appAssessment,
                    status: approve ? 'Retry Approved' as const : 'Completed' as const,
                    retryRequest: {
                        ...appAssessment.retryRequest,
                        status: approve ? 'Approved' as const : 'Denied' as const,
                    }
                };
            }
            return appAssessment;
        });

        const updatedApplicant = { ...applicant, assessments: updatedAssessments };
        setApplicant(updatedApplicant);
        const index = walkinApplicants.findIndex(a => a.id === applicantId);
        if (index > -1) {
            walkinApplicants[index] = updatedApplicant;
        }

        toast({
            title: `Request ${approve ? 'Approved' : 'Denied'}`,
            description: `The retry request has been ${approve ? 'approved' : 'denied'}.`,
        });
    }

    const availableAssessments = assessments.filter(
        (a) => !applicant.assessments.some(aa => aa.assessmentId === a.id)
    );
    
    const handleScoreSelect = (assessmentId: string, attemptNumber: number) => {
        setSelectedScores(prev => ({...prev, [assessmentId]: attemptNumber}));
        toast({ title: `Score for attempt #${attemptNumber} has been marked as final.`});
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assessments & Retries</CardTitle>
                <CardDescription>Assign tests, review scores, and manage retry requests for this applicant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Assign New Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={handleAssignTest}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a test to assign..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableAssessments.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {applicant.assessments.map(appAssessment => {
                    const assessmentDetails = assessments.find(a => a.id === appAssessment.assessmentId);
                    if (!assessmentDetails) return null;

                    const retryRequest = appAssessment.retryRequest;

                    return (
                        <Card key={appAssessment.assessmentId} className="p-4">
                            <h4 className="font-semibold">{assessmentDetails.title}</h4>
                            
                            {retryRequest && retryRequest.status === 'Pending' && (
                                <Alert className="my-4 border-amber-500/50">
                                    <AlertTitle className="text-amber-600 dark:text-amber-400">Pending Retry Request</AlertTitle>
                                    <AlertDescription>
                                        <p className="text-sm italic">"{retryRequest.reason}"</p>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <Button size="sm" onClick={() => handleApproval(appAssessment.assessmentId, true)}><Check className="mr-2 h-4 w-4"/>Approve</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleApproval(appAssessment.assessmentId, false)}><X className="mr-2 h-4 w-4"/>Deny</Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="mt-2 text-sm text-muted-foreground">Score History:</div>
                            {appAssessment.attempts.length > 0 ? (
                                <RadioGroup value={selectedScores[appAssessment.assessmentId]?.toString()} onValueChange={(val) => handleScoreSelect(appAssessment.assessmentId, parseInt(val))}>
                                <ul className="mt-1 space-y-1">
                                {appAssessment.attempts.map((attempt, i) => (
                                    <li key={i} className="flex justify-between items-center text-sm p-2 bg-muted rounded has-[:checked]:bg-primary/20">
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value={attempt.attemptNumber.toString()} id={`score-${attempt.attemptNumber}`} />
                                            <Label htmlFor={`score-${attempt.attemptNumber}`} className="cursor-pointer">Attempt {attempt.attemptNumber}</Label>
                                        </div>
                                        <span className="font-semibold">{attempt.score ?? 'N/A'}{assessmentDetails.passing_score_type === 'percent' ? '%' : ' WPM'}</span>
                                    </li>
                                ))}
                                </ul>
                                </RadioGroup>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center p-2">No attempts yet.</p>
                            )}
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    );
};


export default function ApplicantProfilePage() {
    const params = useParams();
    const applicantId = params.applicantId as string;
    const [notes, setNotes] = useState(MOCK_APPLICANT_BASE.interviewerNotes);
    const [newNote, setNewNote] = useState('');
    const { toast } = useToast();

    // Determine if the applicantId is for a regular applicant or a walk-in
    const isWalkinApplicant = useMemo(() => walkinApplicants.some(a => a.id === applicantId), [applicantId]);

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
                                    <span>Applied on: {MOCK_APPLICANT_BASE.applicationDate} (ID: {MOCK_APPLICANT_BASE.id})</span>
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
                    <TabsTrigger value="assessments">Assessments & Retries</TabsTrigger>
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
                    { isWalkinApplicant ? (
                         <AssessmentsTab applicantId={applicantId} />
                    ) : (
                         <Card>
                            <CardContent>
                                <p className="p-4 text-muted-foreground">Standard assessment module for non-walk-in applicants. Feature to be built.</p>
                            </CardContent>
                         </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
