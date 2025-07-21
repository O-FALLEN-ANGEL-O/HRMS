
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, FileCheck2, UserPlus, Link2 } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import Link from 'next/link';

// Mock Data
const jobOpenings = [
    { title: "Senior Frontend Developer", applicants: 25, stage: "Interview" },
    { title: "Product Manager", applicants: 42, stage: "Shortlisted" },
    { title: "UI/UX Designer", applicants: 18, stage: "New" },
    { title: "DevOps Engineer", applicants: 12, stage: "Offer" },
];

const walkinStats = {
    registrations: 152,
    completedAssessments: 98,
    passed: 45
};

export default function RecruiterDashboard() {
    const { toast } = useToast();

    const handleCopyWalkinLink = () => {
        const walkinUrl = `${window.location.origin}/walkin-drive`;
        navigator.clipboard.writeText(walkinUrl);
        toast({
            title: "Link Copied!",
            description: "The walk-in registration link has been copied to your clipboard.",
        });
    };

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                title="Active Openings"
                value={jobOpenings.length}
                description="Total number of jobs you are hiring for."
                icon={Briefcase}
            />
             <DashboardCard 
                title="Total Applicants"
                value={jobOpenings.reduce((sum, job) => sum + job.applicants, 0)}
                description="Across all active job openings."
                icon={Users}
            />
            <DashboardCard 
                title="Walk-in Registrations"
                value={walkinStats.registrations}
                description="Total applicants for the upcoming drive."
                icon={UserPlus}
            />
            <DashboardCard 
                title="Assessments Passed"
                value={walkinStats.passed}
                description={`${walkinStats.completedAssessments} assessments completed so far.`}
                icon={FileCheck2}
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Active Job Openings</CardTitle>
                    <CardDescription>A snapshot of your current hiring pipeline.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Position</TableHead>
                                <TableHead className="text-center">Applicants</TableHead>
                                <TableHead>Top Stage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobOpenings.map((job) => (
                                <TableRow key={job.title}>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell className="text-center">{job.applicants}</TableCell>
                                    <TableCell>
                                         <Badge variant={job.stage === "Offer" ? "default" : "secondary"}>{job.stage}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Walk-in Drive</CardTitle>
                    <CardDescription>Manage your upcoming walk-in drive event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Total Registrations</p>
                        <p className="font-bold text-lg">{walkinStats.registrations}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Assessments Passed</p>
                        <p className="font-bold text-lg">{walkinStats.passed}</p>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/walkin-drive" target="_blank">View Drive Page</Link>
                    </Button>
                    <Button className="w-full" onClick={handleCopyWalkinLink}>
                        <Link2 className="mr-2 h-4 w-4" /> Copy Registration Link
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
