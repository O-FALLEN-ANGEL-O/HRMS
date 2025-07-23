
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Download, TrendingDown, TrendingUp, User, Users } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for teams and their members
const mockTeams = [
  {
    teamId: 'team-alpha',
    teamName: 'Alpha Chat Support',
    manager: 'David Kim',
    members: [
      { id: 'emp-001', name: 'Anika Sharma', qualityScore: 95, resolutionTime: 12, csat: 98, trend: 'up' },
      { id: 'emp-002', name: 'Rohan Verma', qualityScore: 88, resolutionTime: 15, csat: 92, trend: 'down' },
      { id: 'emp-003', name: 'Priya Mehta', qualityScore: 92, resolutionTime: 11, csat: 95, trend: 'up' },
    ]
  },
  {
    teamId: 'team-beta',
    teamName: 'Beta Voice Support',
    manager: 'Grace Hall',
    members: [
      { id: 'emp-004', name: 'Vikram Singh', qualityScore: 91, resolutionTime: 25, csat: 94, trend: 'up' },
      { id: 'emp-005', name: 'Sonia Desai', qualityScore: 94, resolutionTime: 22, csat: 97, trend: 'up' },
      { id: 'emp-006', name: 'Raj Kumar', qualityScore: 85, resolutionTime: 30, csat: 90, trend: 'down' },
    ]
  }
];

export default function PerformanceDashboardPage() {
  const [selectedTeamId, setSelectedTeamId] = useState(mockTeams[0].teamId);
  const { toast } = useToast();

  const selectedTeam = useMemo(() => {
    return mockTeams.find(team => team.teamId === selectedTeamId) || mockTeams[0];
  }, [selectedTeamId]);

  const teamStats = useMemo(() => {
    const team = selectedTeam;
    const avgQuality = team.members.reduce((acc, m) => acc + m.qualityScore, 0) / team.members.length;
    const avgResolution = team.members.reduce((acc, m) => acc + m.resolutionTime, 0) / team.members.length;
    const avgCsat = team.members.reduce((acc, m) => acc + m.csat, 0) / team.members.length;
    return {
      avgQuality: avgQuality.toFixed(1),
      avgResolution: avgResolution.toFixed(1),
      avgCsat: avgCsat.toFixed(1),
    };
  }, [selectedTeam]);
  
  const handleDownload = (period: 'Weekly' | 'Monthly' | 'Yearly', scope: 'Team' | 'Employee', entityName: string) => {
    toast({
        title: "Report Download Started",
        description: `Your ${period.toLowerCase()} performance report for ${entityName} (${scope}) is being generated.`
    });
  };

  const ReportDownloadMenu = ({ scope, entityName }: { scope: 'Team' | 'Employee', entityName: string }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/> Download Report</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleDownload('Weekly', scope, entityName)}>Weekly</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('Monthly', scope, entityName)}>Monthly</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('Yearly', scope, entityName)}>Yearly</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Team Performance</h1>
          <p className="text-muted-foreground">Monitor and analyze the performance of your teams.</p>
        </div>
        <div className="flex gap-4 items-center">
            <Select onValueChange={setSelectedTeamId} defaultValue={selectedTeamId}>
                <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                    {mockTeams.map(team => (
                        <SelectItem key={team.teamId} value={team.teamId}>{team.teamName}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <ReportDownloadMenu scope="Team" entityName={selectedTeam.teamName} />
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Team Summary: {selectedTeam.teamName}</CardTitle>
            <CardDescription>Managed by {selectedTeam.manager}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium text-muted-foreground">Avg. Quality Score</h4>
                    <p className="text-3xl font-bold">{teamStats.avgQuality}%</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium text-muted-foreground">Avg. Resolution Time</h4>
                    <p className="text-3xl font-bold">{teamStats.avgResolution} min</p>
                </div>
                 <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium text-muted-foreground">Avg. CSAT</h4>
                    <p className="text-3xl font-bold">{teamStats.avgCsat}%</p>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Employee Performance Details</CardTitle>
            <CardDescription>Breakdown of individual performance metrics for {selectedTeam.teamName}.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Quality Score</TableHead>
                        <TableHead>Avg. Resolution Time</TableHead>
                        <TableHead>CSAT</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {selectedTeam.members.map(member => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random`} alt={member.name} />
                                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p>{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.id}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{member.qualityScore}%</TableCell>
                            <TableCell>{member.resolutionTime} min</TableCell>
                            <TableCell>{member.csat}%</TableCell>
                            <TableCell>
                                {member.trend === 'up' 
                                    ? <TrendingUp className="h-5 w-5 text-green-500" /> 
                                    : <TrendingDown className="h-5 w-5 text-red-500" />
                                }
                            </TableCell>
                             <TableCell className="text-right">
                                <ReportDownloadMenu scope="Employee" entityName={member.name} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
