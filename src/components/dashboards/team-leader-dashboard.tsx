
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, TrendingUp } from "lucide-react";
import { TeamCard } from '@/components/team-card';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { useToast } from '@/hooks/use-toast';

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
];

const initialPendingApprovals = [
    { id: 1, type: 'Leave Request', name: 'Rohan Verma', details: '3 days PTO for family event.' },
];

export default function TeamLeaderDashboard() {
  const { toast } = useToast();
  const [pendingApprovals, setPendingApprovals] = useState(initialPendingApprovals);

  const handleApproval = (id: number, approved: boolean) => {
    const item = pendingApprovals.find(p => p.id === id);
    if (!item) return;

    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    toast({
        title: `Request ${approved ? 'Approved' : 'Denied'}`,
        description: `${item.type} from ${item.name} has been ${approved ? 'approved' : 'denied'}.`,
    });
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard 
                title="Team Members"
                value={teamMembers.length}
                description="Active members in your team."
                icon={Users}
            />
             <DashboardCard 
                title="Pending Approvals"
                value={pendingApprovals.length}
                description="Leave requests requiring action."
                icon={Clock}
            />
            <DashboardCard 
                title="Team Performance"
                value={`${Math.round(teamMembers.reduce((acc, member) => acc + member.performance, 0) / teamMembers.length)}%`}
                description="Average performance this quarter."
                icon={TrendingUp}
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
