
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star, Check, TrendingUp, User, Clock } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '../ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const chartConfig = {
  score: {
    label: 'Avg Score',
    color: 'hsl(var(--chart-1))',
  },
};

const qualityScoreData = [
  { month: 'Jan', score: 82 },
  { month: 'Feb', score: 85 },
  { month: 'Mar', score: 88 },
  { month: 'Apr', score: 86 },
  { month: 'May', score: 90 },
  { month: 'Jun', score: 92 },
];

const pendingEvaluations = [
    { interactionId: 'C-1234', agent: 'Anika Sharma', type: 'Chat', date: '2023-07-28' },
    { interactionId: 'V-5678', agent: 'Rohan Verma', type: 'Call', date: '2023-07-28' },
    { interactionId: 'C-1235', agent: 'Priya Mehta', type: 'Chat', date: '2023-07-27' },
];

export default function QaAnalystDashboard() {
  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                title="Evaluations Pending"
                value={pendingEvaluations.length}
                description="Interactions waiting for review."
                icon={Clock}
            />
             <DashboardCard 
                title="Team Avg. Score"
                value="92.5%"
                description="Average quality score this month."
                icon={Star}
            />
            <DashboardCard 
                title="Coaching Assigned"
                value={3}
                description="Agents assigned for coaching sessions."
                icon={User}
            />
            <DashboardCard 
                title="Completed Today"
                value={5}
                description="Evaluations you've completed today."
                icon={Check}
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Pending Evaluations</CardTitle>
                    <CardDescription>A list of agent interactions awaiting your quality review.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent</TableHead>
                                <TableHead>Interaction ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingEvaluations.map((evalItem) => (
                                <TableRow key={evalItem.interactionId}>
                                    <TableCell className="font-medium">{evalItem.agent}</TableCell>
                                    <TableCell>{evalItem.interactionId}</TableCell>
                                    <TableCell><Badge variant="outline">{evalItem.type}</Badge></TableCell>
                                    <TableCell>{evalItem.date}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm">Start Review</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5"/>
                        Quality Score Trend
                    </CardTitle>
                    <CardDescription>Average team quality score over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <AreaChart accessibilityLayer data={qualityScoreData} margin={{ left: -20, right: 10, top: 10, bottom: 10 }}>
                             <CartesianGrid vertical={false} />
                             <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                             <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                             <Area dataKey="score" type="natural" fill="var(--color-score)" fillOpacity={0.4} stroke="var(--color-score)" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
