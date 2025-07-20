
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, Wallet, Settings, Bell } from "lucide-react";

// Mock Data
const myTasks = [
  { id: 'task1', text: 'Complete your "Data Security" training module.', completed: false },
  { id: 'task2', text: 'Update your emergency contact information.', completed: true },
  { id: 'task3', text: 'Submit your Q3 expense report.', completed: false },
];

const companyAnnouncements = [
    { 
        id: 'ann1',
        author: 'Sarah Minh', 
        role: 'CEO',
        avatar: 'https://placehold.co/40x40.png',
        content: "Thrilled to announce our new partnership with FutureWorks Inc! This collaboration will push the boundaries of innovation and open up exciting new opportunities for our team. Great things ahead!",
        time: "2 hours ago"
    },
];

const quickLinks = [
    { text: "My Profile", icon: FileText, href: "/employee/profile" },
    { text: "Leave Balance", icon: Calendar, href: "/employee/leaves" },
    { text: "Payslips", icon: Wallet, href: "/employee/payroll" },
    { text: "Settings", icon: Settings, href: "/employee/settings" },
];


export default function EmployeeDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Tasks</CardTitle>
                    <CardDescription>Action items assigned to you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {myTasks.map((task, index) => (
                            <React.Fragment key={task.id}>
                                <div className="flex items-center gap-4">
                                    <Checkbox id={task.id} checked={task.completed} />
                                    <label htmlFor={task.id} className={`flex-1 text-sm ${task.completed ? 'text-muted-foreground line-through' : ''}`}>
                                        {task.text}
                                    </label>
                                </div>
                                {index < myTasks.length - 1 && <Separator />}
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Company Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                    {companyAnnouncements.map(ann => (
                        <div key={ann.id} className="flex gap-4">
                             <Avatar>
                                <AvatarImage src={ann.avatar} data-ai-hint="person portrait" />
                                <AvatarFallback>{ann.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-sm">{ann.author}</p>
                                        <p className="text-xs text-muted-foreground">{ann.role}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{ann.time}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{ann.content}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>Access important pages quickly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {quickLinks.map(link => (
                         <Button key={link.text} variant="ghost" className="w-full justify-start">
                            <link.icon className="mr-2 h-4 w-4" />
                            {link.text}
                        </Button>
                    ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Bell className="h-8 w-8 mr-4 text-slate-400"/>
                        <span>You&apos;re all caught up! No new notifications.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
