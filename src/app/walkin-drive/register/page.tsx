
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ArrowLeft, Bot, Camera, Loader2, Upload, UserPlus, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { scoreAndParseResumeAction } from '@/app/[role]/recruitment/parse/actions';
import type { ScoreAndParseResumeOutput } from '@/ai/flows/score-and-parse-resume';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { walkinApplicants, WalkinApplicant } from '@/lib/mock-data/walkin';
import { Skeleton } from '@/components/ui/skeleton';

type ParsedData = ScoreAndParseResumeOutput['parsedData'];
type RegistrationState = 'form' | 'success';

const openRoles = [
    { title: "Chat Support Agent" },
    { title: "Voice Support Specialist (English)" },
    { title: "Voice Support Specialist (Kannada)" },
    { title: "Technical Support Engineer" },
];

export default function WalkInRegistrationPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [registrationState, setRegistrationState] = useState<RegistrationState>('form');
    
    const [fileName, setFileName] = useState<string | null>(null);
    const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [newApplicant, setNewApplicant] = useState<WalkinApplicant | null>(null);

    useEffect(() => {
        if (parsedData) {
            setFullName(parsedData.name || '');
            setEmail(parsedData.email || '');
            setPhone(parsedData.phone || '');
        }
    }, [parsedData]);
    
     useEffect(() => {
        if (!isCameraOpen) {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        return;
        }
        const getCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
            videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
            });
            setIsCameraOpen(false);
        }
        };

        getCameraPermission();
        
        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
  }, [isCameraOpen, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
        setFileName(file.name);
        setResumeDataUri(null); // Reset before reading new file
        const reader = new FileReader();
        reader.onload = (e) => {
            setResumeDataUri(e.target?.result as string);
            setIsCameraOpen(false);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setResumeDataUri(dataUri);
        setFileName('camera_capture.jpg');
        setIsCameraOpen(false);
        }
    };
    
    const handleParseResume = useCallback(async () => {
        if (!resumeDataUri) return;
        setLoading(true);
        setParsedData(null);
        try {
            const response = await scoreAndParseResumeAction({ 
                jobDescription: "Customer service or technical support role.", // Generic JD for walk-in
                resumeDataUri 
            });
            setParsedData(response.parsedData);
            toast({ title: "Resume Parsed!", description: "Your details have been pre-filled. Please verify them." });
        } catch (e) {
            console.error(e);
            toast({ title: "Parsing Failed", description: "Could not read data from the resume.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [resumeDataUri, toast]);

    useEffect(() => {
        if (resumeDataUri) {
            handleParseResume();
        }
    }, [resumeDataUri, handleParseResume]);


    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        
        const date = new Date();
        const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
        const applicantCount = walkinApplicants.length + 1;
        const applicantId = `WALK-${dateString}-${String(applicantCount).padStart(3, '0')}`;

        const createdApplicant: WalkinApplicant = {
            id: applicantId,
            fullName,
            email,
            phone,
            status: 'Registered',
            registrationDate: date.toISOString(),
            profilePicture: null,
            resumeUrl: null,
            experience: [],
            education: [],
        };
        
        // In a real app, you would save this to the database
        walkinApplicants.push(createdApplicant);
        setNewApplicant(createdApplicant);

        toast({
            title: "Registration Successful!",
            description: "We've received your registration for the walk-in drive. See you there!",
        });
        setRegistrationState('success');
    };
    
    const handleLogin = () => {
        if (newApplicant) {
            // In real app, create a session
            sessionStorage.setItem('walkinApplicantId', newApplicant.id);
            router.push(`/applicant/${newApplicant.id}`);
        }
    }
    
    const renderSuccessScreen = () => (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <CardTitle className="text-2xl font-headline">Registration Complete!</CardTitle>
                <CardDescription>
                    You are now registered for the OptiTalent walk-in drive. Please save your applicant number.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertTitle className="font-semibold">Your Applicant Number</AlertTitle>
                    <AlertDescription className="text-lg font-bold font-mono tracking-widest py-2 text-center bg-muted rounded-md">
                        {newApplicant?.id}
                    </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">An email with your applicant number and a login link has been sent to <span className="font-semibold">{newApplicant?.email}</span>.</p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleLogin}>
                    Go to Your Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );

    const renderForm = () => (
         <>
             <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2"><Bot />AI Resume Parser (Optional)</CardTitle>
                     <CardDescription>Upload your resume and let our AI pre-fill your application details for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={loading}>
                                <Upload className="mr-2 h-4 w-4" /> Upload Resume
                            </Button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                            <Button variant="outline" className="w-full" onClick={() => setIsCameraOpen(prev => !prev)} disabled={loading}>
                            <Camera className="mr-2 h-4 w-4" /> {isCameraOpen ? 'Close Camera' : 'Capture with Camera'}
                            </Button>
                        </div>
                        {fileName && <p className="text-sm text-muted-foreground mt-2">File: {fileName}</p>}
                    </div>
                    {isCameraOpen && (
                        <div className="mt-4 space-y-2">
                            <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted border" autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                            {hasCameraPermission === false && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Camera Access Required</AlertTitle>
                                        <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                                    </Alert>
                            )}
                            <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">Capture Photo</Button>
                        </div>
                    )}
                </CardContent>
             </Card>
             
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserPlus /> Applicant Details</CardTitle>
                    <CardDescription>Please verify your details and select the role you are applying for.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                           <div className="flex items-center justify-center text-muted-foreground text-sm gap-2">
                            <Loader2 className="h-4 w-4 animate-spin"/> Parsing resume and pre-filling form...
                           </div>
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <form id="registration-form" onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" placeholder="+91 12345 67890" required value={phone} onChange={e => setPhone(e.target.value)}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Desired Role</Label>
                                <Select name="role" required>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {openRoles.map(role => (
                                            <SelectItem key={role.title} value={role.title}>{role.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                     <Button variant="outline" asChild>
                       <Link href="/walkin-drive"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Link>
                    </Button>
                    <Button type="submit" form="registration-form" disabled={loading}>
                       {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                       Submit Registration
                    </Button>
                </CardFooter>
             </Card>
        </>
    );

    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
             <div className="max-w-2xl w-full space-y-6">
                <div className="text-center">
                    <Logo className="inline-flex mb-2" showText={true} />
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Walk-In Registration</h1>
                    <p className="text-muted-foreground">
                        {registrationState === 'form' 
                            ? 'Fill in your details below. You can speed up the process by uploading your resume.'
                            : 'Thank you for registering.'
                        }
                    </p>
                </div>

                {registrationState === 'form' ? renderForm() : renderSuccessScreen()}

                 <footer className="text-center text-sm text-muted-foreground pt-4">
                    &copy; {new Date().getFullYear()} OptiTalent Inc. All Rights Reserved.
                </footer>
            </div>
        </div>
    );
}
