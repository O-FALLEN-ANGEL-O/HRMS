
'use client'

import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Mail, Phone, Plus, History, Gift, Award, FileText, BarChart, FileQuestion, Briefcase, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

function AwardPointsDialog({ employeeId, employeeName, children }: { employeeId: string, employeeName: string, children: React.ReactNode}) {
    const { toast } = useToast();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({ title: 'Points Awarded!', description: `You have awarded points to ${employeeName}` });
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
                        <Input defaultValue={employeeId} disabled />
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

function EditProfileDialog({ employee, children }: { employee: any, children: React.ReactNode}) {
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
    const { user } = useAuth();
    const { toast } = useToast();

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

    const handleResignation = () => {
        toast({
            title: "Resignation Initiated",
            description: "Your request has been submitted to HR for processing.",
            variant: "default",
        });
    }

    if (!user || !user.profile) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="w-24 h-24 border-4 border-background ring-2 ring-primary">
                            <AvatarImage src={user.profile.profile_picture_url || `https://placehold.co/100x100.png`} data-ai-hint="person portrait" alt={user.profile.full_name} />
                            <AvatarFallback>{user.profile.full_name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h1 className="text-3xl font-bold font-headline">{user.profile.full_name} ({user.profile.employee_id})</h1>
                                    <p className="text-muted-foreground">{user.profile.department} / {user.profile.job_title}</p>
                                </div>
                                 <EditProfileDialog employee={user.profile}>
                                    <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                                </EditProfileDialog>
                            </div>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="text-muted-foreground h-4 w-4" />
                                    <span>{user.email}</span>
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
                        <CardContent className="space-y-4">
                            <p>This section provides a brief overview of the employee's professional background, skills, and emergency contact information.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2">Emergency Contact</h4>
                                    <p className="text-sm text-muted-foreground">Name: John Doe (Father)</p>
                                    <p className="text-sm text-muted-foreground">Phone: (987) 654-3210</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Key Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">Project Management</Badge>
                                        <Badge variant="secondary">Team Leadership</Badge>
                                        <Badge variant="secondary">Agile Methodologies</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="performance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Key performance indicators and recent review history.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Metric</TableHead>
                                        <TableHead>Q2 2024</TableHead>
                                        <TableHead>Q3 2024</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Overall Rating</TableCell>
                                        <TableCell>Meets Expectations</TableCell>
                                        <TableCell>Exceeds Expectations</TableCell>
                                        <TableCell><Badge className="bg-green-100 text-green-800">Improving</Badge></TableCell>
                                    </TableRow>
                                     <TableRow>
                                        <TableCell>Tasks Completed</TableCell>
                                        <TableCell>85%</TableCell>
                                        <TableCell>92%</TableCell>
                                        <TableCell><Badge className="bg-green-100 text-green-800">Improving</Badge></TableCell>
                                    </TableRow>
                                </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="documents">
                     <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>A list of employee-related documents.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-3">
                                <li className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                    <div className="flex items-center gap-3"><FileText/><span>Offer Letter.pdf</span></div>
                                    <Button variant="outline" size="sm">Download</Button>
                                </li>
                                <li className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                    <div className="flex items-center gap-3"><FileText/><span>Employee Handbook.pdf</span></div>
                                    <Button variant="outline" size="sm">Download</Button>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="bonus-points">
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>My Points</CardTitle>
                                <AwardPointsDialog employeeId={user.profile.employee_id} employeeName={user.profile.full_name}>
                                    <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4"/>Award Points</Button>
                                </AwardPointsDialog>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={user.profile.profile_picture_url || `https://placehold.co/64x64.png`} data-ai-hint="person portrait" alt={user.profile.full_name} />
                                        <AvatarFallback>{user.profile.full_name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-lg">{user.profile.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{user.profile.employee_id}</p>
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
                        <CardHeader>
                            <CardTitle>Scheduled Interviews</CardTitle>
                            <CardDescription>A list of upcoming interviews you are scheduled to conduct.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-10 text-muted-foreground">
                                <Briefcase className="mx-auto h-12 w-12" />
                                <h3 className="mt-4 text-lg font-semibold">No Upcoming Interviews</h3>
                                <p className="mt-2 text-sm">You have no interviews scheduled at this time.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="resignation">
                     <Card>
                        <CardHeader>
                            <CardTitle>Resignation</CardTitle>
                             <CardDescription>Manage the resignation process if needed.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-4">This action is final and will start the offboarding process.</p>
                            <Button variant="destructive" onClick={handleResignation}>Initiate Resignation</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    