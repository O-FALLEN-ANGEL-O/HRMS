
'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { walkinApplicants, WalkinApplicant, Education, Experience, ApplicantAssessment } from '@/lib/mock-data/walkin';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, LogOut, FileText, Briefcase, GraduationCap, User, Upload, Trash2, PlusCircle, Puzzle, CheckCircle, RefreshCw, Send, AlertTriangle, FileQuestion } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { assessments, Assessment } from '@/lib/mock-data/assessments';
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


function ProfileTab({ applicant, setApplicant }: { applicant: WalkinApplicant; setApplicant: (app: WalkinApplicant) => void }) {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApplicant({ ...applicant, [e.target.name]: e.target.value });
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Keep your contact details up to date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={applicant.fullName} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={applicant.email} onChange={handleInputChange} disabled/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={applicant.phone} onChange={handleInputChange} />
                </div>
            </CardContent>
            <CardFooter>
                <Button>Save Changes</Button>
            </CardFooter>
        </Card>
    )
}

function DocumentsTab({ applicant, setApplicant }: { applicant: WalkinApplicant, setApplicant: (app: WalkinApplicant) => void }) {
    const photoInputRef = React.useRef<HTMLInputElement>(null);
    const resumeInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'resume') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (fileType === 'photo') {
                    setApplicant({ ...applicant, profilePicture: event.target?.result as string });
                } else {
                     setApplicant({ ...applicant, resumeUrl: file.name });
                }
            };
            if(fileType === 'photo') reader.readAsDataURL(file);
            else reader.readAsDataURL(file); // This is just for simulation
        }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     <Avatar className="w-32 h-32 border-4 border-background ring-2 ring-primary">
                        <AvatarImage src={applicant.profilePicture || ''} data-ai-hint="person face" />
                        <AvatarFallback className="text-4xl">{applicant.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <input type="file" ref={photoInputRef} className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'photo')} />
                    <Button variant="outline" onClick={() => photoInputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/> Upload Photo</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Resume</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <FileText className="h-24 w-24 text-muted-foreground"/>
                    {applicant.resumeUrl ? (
                         <p className="text-sm font-medium">Uploaded: {applicant.resumeUrl}</p>
                    ) : (
                         <p className="text-sm text-muted-foreground">No resume uploaded.</p>
                    )}
                    <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'resume')} />
                    <Button variant="outline" onClick={() => resumeInputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/> Upload Resume</Button>
                </CardContent>
            </Card>
        </div>
    )
}

function ExperienceTab({ applicant, setApplicant }: { applicant: WalkinApplicant, setApplicant: (app: WalkinApplicant) => void }) {
     const handleFieldChange = (index: number, field: keyof Experience, value: string) => {
        const newExperience = [...applicant.experience];
        newExperience[index] = {...newExperience[index], [field]: value};
        setApplicant({ ...applicant, experience: newExperience });
    };

    const handleAddItem = () => {
        const newExperience = [{ company: '', title: '', dates: '', description: '' }, ...applicant.experience];
        setApplicant({ ...applicant, experience: newExperience });
    };

    const handleRemoveItem = (index: number) => {
        const newExperience = applicant.experience.filter((_, i) => i !== index);
        setApplicant({ ...applicant, experience: newExperience });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Provide details of your previous work experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button variant="outline" size="sm" onClick={handleAddItem}><PlusCircle className="mr-2 h-4 w-4"/>Add Experience</Button>
                {applicant.experience.map((exp, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-md relative">
                         <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input placeholder="Company" value={exp.company} onChange={e => handleFieldChange(index, 'company', e.target.value)} />
                            <Input placeholder="Job Title" value={exp.title} onChange={e => handleFieldChange(index, 'title', e.target.value)} />
                        </div>
                        <Input placeholder="Dates (e.g., Jan 2020 - Present)" value={exp.dates} onChange={e => handleFieldChange(index, 'dates', e.target.value)} />
                        <Textarea placeholder="Description of your role and responsibilities..." value={exp.description} onChange={e => handleFieldChange(index, 'description', e.target.value)} rows={3}/>
                    </div>
                ))}
            </CardContent>
             <CardFooter>
                <Button>Save Experience</Button>
            </CardFooter>
        </Card>
    );
}

function EducationTab({ applicant, setApplicant }: { applicant: WalkinApplicant, setApplicant: (app: WalkinApplicant) => void }) {
    const handleFieldChange = (index: number, field: keyof Education, value: string) => {
        const newEducation = [...applicant.education];
        newEducation[index] = {...newEducation[index], [field]: value};
        setApplicant({ ...applicant, education: newEducation });
    };

    const handleAddItem = () => {
        const newEducation = [{ institution: '', degree: '', year: '' }, ...applicant.education];
        setApplicant({ ...applicant, education: newEducation });
    };

    const handleRemoveItem = (index: number) => {
        const newEducation = applicant.education.filter((_, i) => i !== index);
        setApplicant({ ...applicant, education: newEducation });
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>Add your educational qualifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button variant="outline" size="sm" onClick={handleAddItem}><PlusCircle className="mr-2 h-4 w-4"/>Add Education</Button>
                {applicant.education.map((edu, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-md relative">
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleRemoveItem(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input placeholder="Institution" value={edu.institution} onChange={e => handleFieldChange(index, 'institution', e.target.value)} />
                            <Input placeholder="Degree" value={edu.degree} onChange={e => handleFieldChange(index, 'degree', e.target.value)} />
                        </div>
                        <Input placeholder="Year of Completion" value={edu.year} onChange={e => handleFieldChange(index, 'year', e.target.value)} />
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button>Save Education</Button>
            </CardFooter>
        </Card>
    )
}

function RetryRequestDialog({ children, onSubmit }: { children: React.ReactNode, onSubmit: (reason: string) => void }) {
    const [reason, setReason] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = () => {
        onSubmit(reason);
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request Assessment Retry</DialogTitle>
                    <DialogDescription>Please provide a reason for your retry request. This will be sent to HR for approval.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="reason">Reason for Retry</Label>
                    <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="E.g., I faced a technical issue..." />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!reason.trim()}>Submit Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function AssessmentsTab({ applicant, setApplicant }: { applicant: WalkinApplicant, setApplicant: (app: WalkinApplicant) => void }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleStartAssessment = (assessmentId: string) => {
        // Find the actual assessment details from the main assessments list
        const assessmentDetails = assessments.find(a => a.id === assessmentId);
        if (assessmentDetails) {
            // Navigate to the generic assessment taking page
             router.push(`/employee/assessments/${assessmentId}`);
        } else {
            toast({ title: 'Assessment not found', variant: 'destructive' });
        }
    };
    
    const handleRetryRequest = (assessmentId: string, reason: string) => {
        const updatedAssessments = applicant.assessments.map(appAssessment => {
            if (appAssessment.assessmentId === assessmentId) {
                return {
                    ...appAssessment,
                    status: 'Retry Requested' as const,
                    retryRequest: {
                        reason: reason,
                        status: 'Pending' as const,
                        requestedAt: new Date().toISOString()
                    }
                };
            }
            return appAssessment;
        });

        setApplicant({ ...applicant, assessments: updatedAssessments });
        toast({ title: "Retry Request Submitted", description: "Your request has been sent to HR for review." });
    };

    const getStatusBadge = (status: ApplicantAssessment['status']) => {
        switch(status) {
            case 'Completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'Not Started': return <Badge variant="secondary">Not Started</Badge>;
            case 'Retry Requested': return <Badge className="bg-yellow-100 text-yellow-800">Retry Requested</Badge>;
            case 'Retry Approved': return <Badge className="bg-blue-100 text-blue-800">Retry Approved</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Assessments</CardTitle>
                <CardDescription>Complete your assigned assessments to proceed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {applicant.assessments.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <FileQuestion className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No Assessments Assigned</h3>
                        <p className="mt-2 text-sm">HR has not assigned any assessments to you yet. Please check back later.</p>
                    </div>
                )}
                {applicant.assessments.map(appAssessment => {
                    const assessmentDetails = assessments.find(a => a.id === appAssessment.assessmentId);
                    if (!assessmentDetails) return null;
                    
                    const lastAttempt = appAssessment.attempts[appAssessment.attempts.length - 1];
                    const canRequestRetry = appAssessment.status === 'Completed' && lastAttempt.score !== null && lastAttempt.score < assessmentDetails.passing_score;

                    return (
                        <Card key={appAssessment.assessmentId} className="p-4">
                           <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">{assessmentDetails.title}</h4>
                                        {getStatusBadge(appAssessment.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{assessmentDetails.process_type} &middot; {assessmentDetails.duration} mins</p>
                                </div>
                                <div className="flex-shrink-0">
                                {appAssessment.status === 'Not Started' || appAssessment.status === 'Retry Approved' ? (
                                    <Button onClick={() => handleStartAssessment(appAssessment.assessmentId)}>
                                        <Puzzle className="mr-2 h-4 w-4" /> Start Test
                                    </Button>
                                ) : canRequestRetry ? (
                                    <RetryRequestDialog onSubmit={(reason) => handleRetryRequest(appAssessment.assessmentId, reason)}>
                                        <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4"/> Request Retry</Button>
                                    </RetryRequestDialog>
                                ) : null}
                                </div>
                           </div>
                           {appAssessment.status !== 'Not Started' && (
                            <div className="mt-4">
                                <h5 className="text-sm font-semibold mb-2">Score History</h5>
                                <div className="space-y-2">
                                    {appAssessment.attempts.map(attempt => (
                                        <div key={attempt.attemptNumber} className="flex justify-between items-center p-2 bg-muted rounded-md">
                                           <p className="text-sm">Attempt {attempt.attemptNumber}</p>
                                           <p className="text-sm font-bold">{attempt.score ?? 'N/A'}<span className="font-normal text-muted-foreground">/{assessmentDetails.passing_score} (Passing)</span></p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                           )}
                           {appAssessment.status === 'Retry Requested' && appAssessment.retryRequest && (
                                <Alert className="mt-4 border-yellow-500/50 text-yellow-900 dark:text-yellow-200 [&>svg]:text-yellow-500">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Retry Request Pending</AlertTitle>
                                    <AlertDescription>
                                        HR is reviewing your request. You will be notified once a decision is made.
                                    </AlertDescription>
                                </Alert>
                           )}
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    )
}


export default function ApplicantDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [applicant, setApplicant] = useState<WalkinApplicant | null>(null);

    useEffect(() => {
        const applicantId = params.applicantId as string;
        const sessionApplicantId = sessionStorage.getItem('walkinApplicantId');
        
        if (sessionApplicantId !== applicantId) {
            toast({ title: "Unauthorized", description: "You do not have permission to view this page.", variant: "destructive" });
            router.push('/walkin-drive/login');
            return;
        }

        // This is a mock data update, in a real app you'd re-fetch
        const foundApplicant = walkinApplicants.find(app => app.id === applicantId);
        if (foundApplicant) {
            setApplicant(foundApplicant);
        } else {
            toast({ title: "Applicant Not Found", variant: "destructive" });
            router.push('/walkin-drive/login');
        }
    }, [params.applicantId, router, toast]);

    const handleLogout = () => {
        sessionStorage.removeItem('walkinApplicantId');
        router.push('/walkin-drive');
        toast({title: "Logged Out", description: "You have been logged out of your temporary account."});
    };

    if (!applicant) {
        return <div className="flex h-screen items-center justify-center">Loading applicant profile...</div>;
    }
    
    const handleSetApplicant = (updatedApplicant: WalkinApplicant) => {
        // In a real app, this would be a PATCH request to an API
        // For the mock, we update the local state and the "database"
        setApplicant(updatedApplicant);
        const index = walkinApplicants.findIndex(a => a.id === updatedApplicant.id);
        if (index !== -1) {
            walkinApplicants[index] = updatedApplicant;
        }
    }


    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                           <div>
                             <CardTitle className="text-3xl font-headline">Welcome, {applicant.fullName}!</CardTitle>
                             <CardDescription>Your Applicant ID: {applicant.id}</CardDescription>
                           </div>
                            <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Your Application Status</h3>
                                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{applicant.status}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="assessments">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
                        <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Profile</TabsTrigger>
                        <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4" /> Documents</TabsTrigger>
                        <TabsTrigger value="experience"><Briefcase className="mr-2 h-4 w-4" /> Experience</TabsTrigger>
                        <TabsTrigger value="education"><GraduationCap className="mr-2 h-4 w-4" /> Education</TabsTrigger>
                        <TabsTrigger value="assessments"><Puzzle className="mr-2 h-4 w-4" /> Assessments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile">
                        <ProfileTab applicant={applicant} setApplicant={handleSetApplicant} />
                    </TabsContent>
                    <TabsContent value="documents">
                        <DocumentsTab applicant={applicant} setApplicant={handleSetApplicant} />
                    </TabsContent>
                    <TabsContent value="experience">
                        <ExperienceTab applicant={applicant} setApplicant={handleSetApplicant} />
                    </TabsContent>
                    <TabsContent value="education">
                        <EducationTab applicant={applicant} setApplicant={handleSetApplicant} />
                    </TabsContent>
                    <TabsContent value="assessments">
                        <AssessmentsTab applicant={applicant} setApplicant={handleSetApplicant} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
