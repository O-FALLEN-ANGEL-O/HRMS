
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, Clock, TrendingUp, Award } from "lucide-react";
import { TeamCard } from '@/components/team-card';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { useTeam } from '@/hooks/use-team';

// Mock Data
const initialPendingApprovals = [
    { id: 1, type: 'Leave Request', name: 'Rohan Verma', details: '3 days PTO for family event.' },
    { id: 2, type: 'Expense Report', name: 'Anika Sharma', details: '$250 for software license.' },
    { id: 3, type: 'Timesheet', name: 'Priya Mehta', details: '45 hours for week ending July 26.' },
];

export default function ManagerDashboard() {
  const { toast } = useToast();
  const [pendingApprovals, setPendingApprovals] = useState(initialPendingApprovals);
  const teamMembers = useTeam();

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

  const handleApproval = (id: number, approved: boolean) => {
    const item = pendingApprovals.find(p => p.id === id);
    if (!item) return;

    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    toast({
        title: `Request ${approved ? 'Approved' : 'Denied'}`,
        description: `${item.type} from ${item.name} has been ${approved ? 'approved' : 'denied'}.`,
    });
  }
  
  const avgPerformance = teamMembers.length > 0 
    ? Math.round(teamMembers.reduce((acc, member) => acc + (member.performance || 0), 0) / teamMembers.length)
    : 0;
    
  const totalTasksCompleted = teamMembers.reduce((sum, member) => sum + (member.tasksCompleted || 0), 0);

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
                value={`${avgPerformance}%`}
                description="Average performance score this quarter."
                icon={TrendingUp}
            />
            <DashboardCard 
                title="Tasks Completed"
                value={totalTasksCompleted}
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
                        {pendingApprovals.map((approval) => (
                           <div key={approval.id} className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-semibold">{approval.type}</p>
                                <p className="text-sm text-muted-foreground">{approval.name} - {approval.details}</p>
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" className="flex-1" onClick={() => handleApproval(approval.id, true)}>Approve</Button>
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleApproval(approval.id, false)}>Deny</Button>
                                </div>
                           </div>
                        ))}
                         {pendingApprovals.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No pending approvals.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
