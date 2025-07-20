
'use client'

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Mail, Phone, Plus, History, Gift, Award } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MOCK_USERS = {
  Admin: { full_name: 'Admin User', email: 'admin@hrplus.com', avatar_url: '', id: 'PEP01', department: 'Administration', title: 'System Administrator' },
  HR: { full_name: 'HR User', email: 'hr@hrplus.com', avatar_url: '', id: 'PEP02', department: 'Human Resources', title: 'HR Generalist' },
  Manager: { full_name: 'Manager User', email: 'manager@hrplus.com', avatar_url: '', id: 'PEP03', department: 'Engineering', title: 'Engineering Manager' },
  Employee: { full_name: 'Employee User', email: 'employee@hrplus.com', avatar_url: '', id: 'PEP04', department: 'Marketing', title: 'Marketing Specialist' },
  Recruiter: { full_name: 'Recruiter User', email: 'recruiter@hrplus.com', avatar_url: '', id: 'PEP05', department: 'Human Resources', title: 'Talent Acquisition' },
  Guest: { full_name: 'Guest User', email: 'guest@hrplus.com', avatar_url: '', id: 'PEP06', department: 'N/A', title: 'Guest' },
  'qa-analyst': { full_name: 'QA Analyst', email: 'qa@hrplus.com', avatar_url: '', id: 'PEP07', department: 'Quality', title: 'QA Analyst' },
  'process-manager': { full_name: 'Process Manager', email: 'pm@hrplus.com', avatar_url: '', id: 'PEP08', department: 'Operations', title: 'Process Manager' },
};

type UserData = typeof MOCK_USERS[keyof typeof MOCK_USERS];


function AwardPointsDialog({ employee, children }: { employee: UserData, children: React.ReactNode}) {
    const { toast } = useToast();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({ title: 'Points Awarded!', description: `You have awarded points to ${employee.full_name}` });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Award Bonus Points</DialogTitle>
                    <DialogDescription>Recognize a colleague by awarding them bonus points.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <Input defaultValue={employee.id} disabled />
                        <Input type="number" placeholder="Points" required />
                        <Textarea placeholder="Reason for award (e.g., great teamwork!)" required />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Award Points</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function RedeemPointsDialog({ children }: { children: React.ReactNode}) {
    const { toast } = useToast();
     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({ title: 'Redemption Submitted!', description: 'Your request to redeem points has been sent for approval.' });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Redeem Bonus Points</DialogTitle>
                    <DialogDescription>Convert your points into rewards. Submit your request for approval.</DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <Input type="number" placeholder="Points to redeem" required />
                        <Textarea placeholder="Notes for approver (optional)" />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Submit for Approval</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EditProfileDialog({ employee, children }: { employee: UserData, children: React.ReactNode}) {
    const { toast } = useToast();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({ title: 'Profile Updated!', description: 'Your profile information has been saved.' });
    };
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your personal and contact information.</DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" defaultValue={employee.full_name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" defaultValue="(123) 456-7890" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function ProfilePage() {
    const params = useParams();
    const role = (params.role as string) as keyof typeof MOCK_USERS;
    const userData = MOCK_USERS[role] || MOCK_USERS['Guest'];

    const bonusHistory = [
        { type: "redeem", action: "Redeem request created for 2,500 points", date: "19/07/2025" },
        { type: "redeem", action: "Redeem request created for 1,000 points", date: "16/07/2025" },
        { type: "award", action: `Vishal Anand (PEP00) Added 3,500 bonus points for 'Digi-versary'`, date: "12/07/2025" },
        { type: "award", action: `Admin added 500 bonus points for 'Employee of the Month'`, date: "01/07/2025" },
        { type: "award", action: "Bonus Account created", date: "11/06/2025" },
    ];

    const getHistoryIcon = (type: string) => {
        switch(type) {
            case 'redeem': return <Gift className="h-4 w-4 text-red-500"/>;
            case 'award': return <Award className="h-4 w-4 text-green-500"/>;
            default: return <History className="h-4 w-4 text-muted-foreground"/>;
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary">
                            <AvatarImage src={userData.avatar_url || `https://placehold.co/100x100.png`} data-ai-hint="person portrait" alt={userData.full_name} />
                            <AvatarFallback>{userData.full_name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h1 className="text-3xl font-bold font-headline">{userData.full_name} ({userData.id})</h1>
                                    <p className="text-muted-foreground">{userData.department} / {userData.title}</p>
                                </div>
                                 <EditProfileDialog employee={userData}>
                                    <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                                </EditProfileDialog>
                            </div>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="text-muted-foreground h-4 w-4" />
                                    <span>{userData.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="text-muted-foreground h-4 w-4" />
                                    <span>(123) 456-7890</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="bonus-points">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="bonus-points">Bonus Points</TabsTrigger>
                    <TabsTrigger value="interviews">Scheduled Interview</TabsTrigger>
                    <TabsTrigger value="resignation">Resignation</TabsTrigger>
                </TabsList>
                <TabsContent value="about">
                    <Card>
                        <CardHeader><CardTitle>About</CardTitle></CardHeader>
                        <CardContent><p>Details about the employee will be shown here.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="performance">
                    <Card>
                        <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
                        <CardContent><p>Performance metrics and reviews will be shown here.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="documents">
                     <Card>
                        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                        <CardContent><p>Employee documents will be listed here.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="bonus-points">
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>My Points</CardTitle>
                                <AwardPointsDialog employee={userData}>
                                    <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/>Award Points</Button>
                                </AwardPointsDialog>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={userData.avatar_url || `https://placehold.co/64x64.png`} data-ai-hint="person portrait" alt={userData.full_name} />
                                        <AvatarFallback>{userData.full_name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-lg">{userData.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{userData.id}</p>
                                    </div>
                               </div>
                               <Separator/>
                               <div className="text-center py-4">
                                   <p className="text-sm text-muted-foreground">Balance points to redeem</p>
                                   <p className="text-5xl font-bold tracking-tighter">25,003</p>
                               </div>
                               <RedeemPointsDialog>
                                   <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <Gift className="mr-2 h-5 w-5"/> Redeem Now
                                    </Button>
                               </RedeemPointsDialog>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>Recent bonus point transactions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {bonusHistory.map((item, index) => (
                                        <li key={index} className="flex items-start justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                                    {getHistoryIcon(item.type)}
                                                </div>
                                                <span className="flex-1">{item.action}</span>
                                            </div>
                                            <span className="text-muted-foreground whitespace-nowrap ml-4">{item.date}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                 <TabsContent value="interviews">
                     <Card>
                        <CardHeader><CardTitle>Scheduled Interviews</CardTitle></CardHeader>
                        <CardContent><p>Interview schedules will be shown here.</p></CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="resignation">
                     <Card>
                        <CardHeader><CardTitle>Resignation</CardTitle></CardHeader>
                        <CardContent><p>Resignation details will be shown here.</p></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
