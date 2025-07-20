
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, Clock, TrendingUp, Award } from "lucide-react";
import { TeamCard } from '@/components/team-card';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

// Mock Data
const teamMembers = [
  {
    name: 'Anika Sharma',
    title: 'Senior Software Engineer',
    avatar: 'https://placehold.co/40x40.png',
    status: 'Online',
    tasksCompleted: 8,
    tasksPending: 2,
    performance: 92,
  },
  {
    name: 'Rohan Verma',
    title: 'UI/UX Designer',
    avatar: 'https://placehold.co/40x40.png',
    status: 'Away',
    tasksCompleted: 5,
    tasksPending: 1,
    performance: 85,
  },
   {
    name: 'Priya Mehta',
    title: 'Junior Frontend Developer',
    avatar: 'https://placehold.co/40x40.png',
    status: 'In a meeting',
    tasksCompleted: 10,
    tasksPending: 0,
    performance: 98,
  },
   {
    name: 'Vikram Rao',
    title: 'Backend Engineer',
    avatar: 'https://placehold.co/40x40.png',
    status: 'Online',
    tasksCompleted: 7,
    tasksPending: 3,
    performance: 90,
  },
];

const pendingApprovals = [
    { type: 'Leave Request', name: 'Rohan Verma', details: '3 days PTO for family event.' },
    { type: 'Expense Report', name: 'Anika Sharma', details: '$250 for software license.' },
    { type: 'Timesheet', name: 'Priya Mehta', details: '45 hours for week ending July 26.' },
];

export default function ManagerDashboard() {
  const { toast } = useToast();

  const handleGiveAward = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const empId = formData.get('empId');
    if (empId) {
        toast({
            title: 'Award Sent! 🎉',
            description: `You've successfully given an award to ${empId}.`,
        });
        e.currentTarget.reset();
    }
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                title="Team Members"
                value={teamMembers.length}
                description="Active members in your team."
                icon={Users}
            />
             <DashboardCard 
                title="Pending Approvals"
                value={pendingApprovals.length}
                description="Items requiring your action."
                icon={Clock}
            />
            <DashboardCard 
                title="Team Performance"
                value={`${Math.round(teamMembers.reduce((acc, member) => acc + member.performance, 0) / teamMembers.length)}%`}
                description="Average performance score this quarter."
                icon={TrendingUp}
            />
            <DashboardCard 
                title="Tasks Completed"
                value={teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0)}
                description="Total tasks completed by team this week."
                icon={CheckCircle}
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Team Overview</CardTitle>
                        <CardDescription>Monitor your team's status and performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2">
                            {teamMembers.map((member) => (
                                <TeamCard key={member.name} member={member} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recognize a Peer</CardTitle>
                        <CardDescription>Give an award to a deserving colleague.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleGiveAward}>
                            <Input name="empId" placeholder="Enter Employee ID (e.g., EMP001)" required />
                            <Textarea name="message" placeholder="Reason for award (optional)" />
                            <Button type="submit" className="w-full">
                                <Award className="mr-2 h-4 w-4" />
                                Give Award
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                        <CardDescription>Actions that require your attention.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingApprovals.map((approval, index) => (
                           <div key={index} className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-semibold">{approval.type}</p>
                                <p className="text-sm text-muted-foreground">{approval.name} - {approval.details}</p>
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="flex-1">Approve</Button>
                                    <Button size="sm" variant="outline" className="flex-1">Deny</Button>
                                </div>
                           </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
