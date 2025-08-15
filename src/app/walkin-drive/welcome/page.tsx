
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ArrowLeft, Loader2, LogIn, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { walkinApplicants } from '@/lib/mock-data/walkin';
import { mockUsers } from '@/lib/mock-data/employees';
import { useAuth } from '@/hooks/use-auth';

export default function WelcomeNewHirePage() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [applicant, setApplicant] = useState<any>(null);
    const [newEmployeeId, setNewEmployeeId] = useState<string | null>(null);

    useEffect(() => {
        const applicantId = searchParams.get('applicantId');
        if (!applicantId) {
            toast({ title: "Invalid Link", description: "Applicant ID not found.", variant: 'destructive'});
            router.push('/walkin-drive');
            return;
        }

        const foundApplicant = walkinApplicants.find(a => a.id === applicantId);
        if (foundApplicant) {
            setApplicant(foundApplicant);
            // Simulate employee account creation
            const existingEmployee = mockUsers.find(u => u.email === foundApplicant.email);
            if (existingEmployee) {
                setNewEmployeeId(existingEmployee.profile.employee_id);
            } else {
                // Create a new employee if they don't exist (this would happen on backend)
                const employeeId = `PEP${String(mockUsers.length + 1).padStart(4,'0')}`;
                const newEmployee = {
                    id: `user-${Date.now()}`,
                    email: foundApplicant.email,
                    role: 'employee' as const,
                    profile: {
                        id: `profile-${Date.now()}`,
                        full_name: foundApplicant.fullName,
                        employee_id: employeeId,
                        department: { name: 'To Be Assigned' },
                        department_id: 'd-tba',
                        job_title: 'New Hire',
                        role: 'employee' as const,
                        status: 'Active' as const,
                        profile_picture_url: foundApplicant.profilePicture,
                        phone_number: foundApplicant.phone,
                        // Automatically transfer professional and family info
                        professionalInfo: {
                            experience: foundApplicant.experience,
                            education: foundApplicant.education,
                            skills: [], // These would be parsed or entered
                            certifications: [],
                        },
                        familyAndHealthInfo: { // Assuming this would be collected too
                            dependents: [],
                            health: { bloodGroup: '', allergies: '' },
                            emergencyContact: { name: '', relationship: '', phone: '' }
                        }
                    }
                };
                mockUsers.push(newEmployee);
                setNewEmployeeId(employeeId);
            }
        } else {
            toast({ title: "Applicant Not Found", variant: 'destructive'});
            router.push('/walkin-drive');
        }
    }, [searchParams, router, toast]);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call to set password
        await new Promise(res => setTimeout(res, 1000));
        
        toast({
            title: "Password Set Successfully!",
            description: "Logging you into your new account...",
        });

        // Use the auth context to log in the new user
        if (newEmployeeId) {
            sessionStorage.removeItem('walkinApplicantId');
            // This flag will trigger the welcome popup on the dashboard
            sessionStorage.setItem('isNewUser', 'true');
            await login(newEmployeeId);
        }
        // No need to setLoading(false) as we are navigating
    };

    if (!applicant) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <Logo className="inline-flex mb-2" showText={true} />
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome to OptiTalent!</h1>
                    <p className="text-muted-foreground">
                        Your account has been created. Please set your password to continue.
                    </p>
                </div>
                
                <Card>
                    <form onSubmit={handleSetPassword}>
                        <CardHeader>
                            <CardTitle>Set Your Password</CardTitle>
                            <CardDescription>Your Employee ID is <span className="font-bold font-mono">{newEmployeeId}</span>. Use it to log in in the future.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" required />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                                {loading ? 'Saving...' : 'Set Password & Login'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
