
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { walkinApplicants } from '@/lib/mock-data/walkin';

export default function WalkInLoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target as HTMLFormElement);
        const applicantId = formData.get('applicantId') as string;
        const email = formData.get('email') as string;

        // Mock validation
        const applicant = walkinApplicants.find(
            app => app.id.toLowerCase() === applicantId.toLowerCase() && app.email.toLowerCase() === email.toLowerCase()
        );

        setTimeout(() => { // Simulate network delay
            if (applicant) {
                toast({
                    title: "Login Successful!",
                    description: "Redirecting to your onboarding portal...",
                });
                sessionStorage.setItem('walkinApplicantId', applicant.id);
                router.push(`/applicant/${applicant.id}`);
            } else {
                toast({
                    title: "Login Failed",
                    description: "Invalid Applicant Number or Email. Please check your details and try again.",
                    variant: "destructive",
                });
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <Logo className="inline-flex mb-2" showText={true} />
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Onboarding Portal</h1>
                    <p className="text-muted-foreground">
                        Welcome! Please enter your details to begin the onboarding process.
                    </p>
                </div>
                
                <Card>
                    <form onSubmit={handleLogin}>
                        <CardHeader>
                            <CardTitle>Secure Login</CardTitle>
                            <CardDescription>Use the Applicant Number from your offer email to log in.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="applicantId">Applicant Number</Label>
                                <Input id="applicantId" name="applicantId" placeholder="e.g., WALK-20240729-001" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Registered Email</Label>
                                <Input id="email" type="email" name="email" placeholder="you@example.com" required />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                                {loading ? 'Verifying...' : 'Access Portal'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                 <footer className="text-center text-sm text-muted-foreground pt-4">
                    Having trouble? Please contact your recruiter.
                    <p>&copy; {new Date().getFullYear()} OptiTalent Inc. All Rights Reserved.</p>
                </footer>
            </div>
        </div>
    );
}
