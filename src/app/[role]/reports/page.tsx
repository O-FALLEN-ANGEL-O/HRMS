
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart, CheckCircle, Percent, Calendar, Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/hooks/use-team';
import { DashboardCard } from '@/components/ui/dashboard-card';

export default function ManagerReportsPage() {
    const { toast } = useToast();
    const teamMembers = useTeam();
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<any[] | null>(null);
    const [reportParams, setReportParams] = useState({ target: 'team-alpha', period: 'weekly' });

    const availableTeams = useMemo(() => {
        // In a real app, this would be fetched based on the manager's ID.
        // For this demo, we'll just mock two teams.
        return [
            { id: 'team-alpha', name: 'Alpha Support Team' },
            { id: 'team-beta', name: 'Beta Support Team' },
        ];
    }, []);

    const teamForReport = useMemo(() => {
        if (reportParams.target === 'all') {
            return teamMembers;
        }
        // This is a simplification. In reality, you'd filter by team ID.
        // We'll just return a slice of the team for variety.
        return reportParams.target === 'team-alpha' ? teamMembers.slice(0, 2) : teamMembers.slice(2, 4);
    }, [reportParams.target, teamMembers]);
    
    const summaryStats = useMemo(() => {
        if (!reportData) return null;
        const totalMembers = reportData.length;
        const avgAttendance = reportData.reduce((sum, e) => sum + e.attendance, 0) / totalMembers;
        const avgTaskCompletion = reportData.reduce((sum, e) => sum + e.taskCompletion, 0) / totalMembers;
        return {
            avgAttendance: avgAttendance.toFixed(1),
            avgTaskCompletion: avgTaskCompletion.toFixed(1),
        }
    }, [reportData]);


    const handleGenerateReport = () => {
        setIsLoading(true);
        setReportData(null);
        // Simulate API call to fetch report data
        setTimeout(() => {
            const generatedData = teamForReport.map(member => ({
                id: member.id,
                name: member.name,
                attendance: Math.floor(Math.random() * 11) + 90, // 90-100%
                taskCompletion: Math.floor(Math.random() * 21) + 80, // 80-100%
                assessmentScore: Math.floor(Math.random() * 21) + 75, // 75-95%
                leaveStatus: Math.random() > 0.9 ? 'On Leave' : 'Present',
            }));
            setReportData(generatedData);
            setIsLoading(false);
            toast({ title: 'Report Generated', description: 'Your performance report is ready for review.' });
        }, 1500);
    };
    
    const handleDownload = (format: 'PDF' | 'CSV') => {
        toast({
            title: 'Download Started',
            description: `Your ${reportParams.period} report for ${reportParams.target} in ${format} format is downloading.`
        })
    }
    
    const getLeaveStatusBadge = (status: string) => {
        if (status === 'On Leave') return <Badge variant="destructive">{status}</Badge>;
        return <Badge variant="secondary" className="bg-green-100 text-green-800">{status}</Badge>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Performance Reports</h1>
                <p className="text-muted-foreground">Generate and review performance reports for your teams.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Generate a New Report</CardTitle>
                    <CardDescription>Select the team and time period to generate a report.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Select value={reportParams.target} onValueChange={(value) => setReportParams(p => ({...p, target: value}))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Target" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All My Teams</SelectItem>
                            {availableTeams.map(team => (
                                <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={reportParams.period} onValueChange={(value) => setReportParams(p => ({...p, period: value}))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateReport} disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : 'Generate Report'}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="text-center py-10">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Gathering data and compiling your report...</p>
                </div>
            )}
            
            {reportData && summaryStats && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <CardTitle>Report for {availableTeams.find(t => t.id === reportParams.target)?.name || 'All Teams'}</CardTitle>
                                <CardDescription>Period: {reportParams.period.charAt(0).toUpperCase() + reportParams.period.slice(1)}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleDownload('PDF')}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                                <Button variant="outline" onClick={() => handleDownload('CSV')}><Download className="mr-2 h-4 w-4" /> CSV</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            <DashboardCard title="Team Members" value={reportData.length} icon={Users} />
                            <DashboardCard title="Avg. Attendance" value={`${summaryStats.avgAttendance}%`} icon={Calendar} />
                            <DashboardCard title="Avg. Task Completion" value={`${summaryStats.avgTaskCompletion}%`} icon={CheckCircle} />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Attendance</TableHead>
                                    <TableHead>Task Completion</TableHead>
                                    <TableHead>Assessment Score</TableHead>
                                    <TableHead>Leave Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell>{employee.attendance}%</TableCell>
                                        <TableCell>{employee.taskCompletion}%</TableCell>
                                        <TableCell>{employee.assessmentScore}%</TableCell>
                                        <TableCell>{getLeaveStatusBadge(employee.leaveStatus)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
