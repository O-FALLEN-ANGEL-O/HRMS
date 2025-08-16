
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Info, Upload, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const mockRequests = [
    { id: 'req-001', employeeName: 'Rohan Verma', employeeId: 'PEP0013', date: '2025-07-24', reason: 'Forgot to punch out after leaving office.', status: 'Pending', avatar: 'https://ui-avatars.com/api/?name=Rohan+Verma&background=random' },
    { id: 'req-002', employeeName: 'Priya Mehta', employeeId: 'PEP0014', date: '2025-07-22', reason: 'System glitch during biometric scan.', status: 'Pending', avatar: 'https://ui-avatars.com/api/?name=Priya+Mehta&background=random' },
];

function EmployeeView() {
    const [date, setDate] = useState<Date | undefined>(new Date(2025, 6, 25));
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Request Submitted",
            description: "Your attendance regularization request has been sent for approval.",
        });
        router.back();
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Day</CardTitle>
                        <CardDescription>Select the day(s) for which you wish to apply for regularization.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="p-0"
                        />
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-4">
                            <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-1.5"></div><span>Absent</span></div>
                            <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-yellow-200 border border-yellow-400 mr-1.5"></div><span>Half Day Absent</span></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                        {date && <CardDescription>Shift: 09:00 - 18:00 for {format(date, "PPP")}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup defaultValue="both" className="flex space-x-4 text-sm">
                            <div className="flex items-center">
                                <RadioGroupItem value="forgot-in" id="forgot-in" />
                                <Label htmlFor="forgot-in" className="ml-2">Forgot In</Label>
                            </div>
                            <div className="flex items-center">
                                <RadioGroupItem value="forgot-out" id="forgot-out" />
                                <Label htmlFor="forgot-out" className="ml-2">Forgot Out</Label>
                            </div>
                            <div className="flex items-center">
                                <RadioGroupItem value="both" id="both" />
                                <Label htmlFor="both" className="ml-2">Both</Label>
                            </div>
                        </RadioGroup>

                        <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                                <Label htmlFor="start-hours">Start Hr*</Label>
                                <Input id="start-hours" type="text" defaultValue="09" className="mt-1 text-center" />
                            </div>
                            <div>
                                <Label htmlFor="start-minutes">Start Min*</Label>
                                <Input id="start-minutes" type="text" defaultValue="00" className="mt-1 text-center" />
                            </div>
                            <div>
                                <Label htmlFor="end-hours">End Hr*</Label>
                                <Input id="end-hours" type="text" defaultValue="18" className="mt-1 text-center" />
                            </div>
                            <div>
                                <Label htmlFor="end-minutes">End Min*</Label>
                                <Input id="end-minutes" type="text" defaultValue="00" className="mt-1 text-center" />
                            </div>
                        </div>

                        <div className="bg-blue-100 border border-blue-200 text-blue-800 text-sm p-3 rounded-md flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>Note: You are marking regularization for 9 hours 0 minutes.</span>
                        </div>

                        <div>
                            <Label htmlFor="comments">Comments*</Label>
                            <Textarea id="comments" rows={2} className="mt-1" />
                        </div>

                        <div>
                            <Label>Attachment</Label>
                            <div className="mt-1 flex justify-between items-center">
                                <Button type="button" variant="outline" size="sm">
                                    <Upload className="mr-2 h-4 w-4"/> UPLOAD FILE
                                </Button>
                                <span className="text-sm font-medium text-primary">AR balance: 5 Monthly</span>
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">Submit</Button>
                    </CardFooter>
                </Card>
            </div>
        </form>
    );
}

function ManagerView() {
    const [requests, setRequests] = useState(mockRequests);
    const { toast } = useToast();

    const handleAction = (requestId: string, action: 'Approved' | 'Rejected') => {
        setRequests(prev => prev.filter(req => req.id !== requestId));
        toast({
            title: `Request ${action}`,
            description: `The request ${requestId} has been ${action.toLowerCase()}.`,
        });
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Pending Regularization Requests</CardTitle>
                <CardDescription>Review and approve or deny attendance correction requests from your team.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map(request => (
                            <TableRow key={request.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={request.avatar} alt={request.employeeName} />
                                            <AvatarFallback>{request.employeeName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{request.employeeName}</p>
                                            <p className="text-xs text-muted-foreground">{request.employeeId}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{request.date}</TableCell>
                                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" size="sm" onClick={() => handleAction(request.id, 'Approved')}>
                                            <Check className="mr-2 h-4 w-4 text-green-500"/> Approve
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleAction(request.id, 'Rejected')}>
                                            <X className="mr-2 h-4 w-4"/> Deny
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                         {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    No pending requests.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function RegularizeAttendancePage() {
    const { user } = useAuth();
    const managerRoles = ['admin', 'hr', 'manager', 'team-leader'];
    const isManager = user && managerRoles.includes(user.role);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Attendance Regularization</h1>
                    <p className="text-muted-foreground">
                        {isManager 
                            ? "Manage attendance correction requests for your team." 
                            : "Select a day and submit a request to correct your attendance."}
                    </p>
                </div>
            </header>
            {isManager ? <ManagerView /> : <EmployeeView />}
        </div>
    );
}

