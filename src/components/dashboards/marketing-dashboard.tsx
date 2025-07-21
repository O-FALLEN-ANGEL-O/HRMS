
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, UserCheck, Check, X, MoveRight } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '../ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'hsl(var(--chart-1))',
  },
};

const campaignPerformanceData = [
  { month: 'Jan', leads: 186 },
  { month: 'Feb', leads: 305 },
  { month: 'Mar', leads: 237 },
  { month: 'Apr', leads: 273 },
  { month: 'May', leads: 209 },
  { month: 'Jun', leads: 419 },
];

const salesLeaderboard = [
    { rank: 1, name: 'Rohan Gupta', leads: 45, revenue: 12500 },
    { rank: 2, name: 'Priya Patel', leads: 38, revenue: 10200 },
    { rank: 3, name: 'Aarav Sharma', leads: 35, revenue: 9800 },
];

const contentApprovalQueue = [
    { id: 'C-001', title: 'Q3 Social Media Campaign Images', type: 'Social Media', submittedBy: 'Anika Sharma' },
    { id: 'C-002', title: 'New Product Launch Blog Post', type: 'Blog', submittedBy: 'Vikram Singh' },
];

const salesPipeline = [
    { stage: 'Prospects', count: 120, color: 'bg-blue-500' },
    { stage: 'Qualified Leads', count: 85, color: 'bg-indigo-500' },
    { stage: 'Needs Analysis', count: 60, color: 'bg-purple-500' },
    { stage: 'Proposal Sent', count: 40, color: 'bg-pink-500' },
    { stage: 'Negotiation', count: 25, color: 'bg-rose-500' },
    { stage: 'Closed-Won', count: 15, color: 'bg-green-500' },
];

export default function MarketingDashboard() {
  const { toast } = useToast();
  
  const handleApproval = (id: string, approved: boolean) => {
    toast({
        title: `Content ${approved ? 'Approved' : 'Rejected'}`,
        description: `Content piece ${id} has been processed.`,
    });
  }

  const maxPipelineCount = useMemo(() => Math.max(...salesPipeline.map(p => p.count)), []);

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard 
                title="New Leads (This Month)"
                value="419"
                description="+20.1% from last month"
                icon={TrendingUp}
            />
             <DashboardCard 
                title="Converted Leads"
                value="135"
                description="18% Conversion Rate"
                icon={UserCheck}
            />
            <DashboardCard 
                title="Campaign ROI"
                value="+12%"
                description="Overall return on investment"
                icon={Target}
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Campaign Performance</CardTitle>
                        <CardDescription>Leads generated over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <AreaChart accessibilityLayer data={campaignPerformanceData} margin={{ left: -20, right: 10, top: 10, bottom: 10 }}>
                                 <CartesianGrid vertical={false} />
                                 <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                 <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                 <Area dataKey="leads" type="natural" fill="var(--color-leads)" fillOpacity={0.4} stroke="var(--color-leads)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Content Approval Queue</CardTitle>
                        <CardDescription>Review and approve marketing content submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Content</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contentApprovalQueue.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <p className='font-medium'>{item.title}</p>
                                            <p className='text-xs text-muted-foreground'>by {item.submittedBy}</p>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="icon" variant="outline" className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleApproval(item.id, true)}><Check className="h-4 w-4"/></Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => handleApproval(item.id, false)}><X className="h-4 w-4"/></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Team Leaderboard</CardTitle>
                        <CardDescription>Top performers this quarter.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesLeaderboard.map(member => (
                                    <TableRow key={member.rank}>
                                        <TableCell className="font-bold text-lg">{member.rank}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.leads} leads</p>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">${member.revenue.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Pipeline</CardTitle>
                        <CardDescription>A visual representation of the current sales funnel.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {salesPipeline.map((item, index) => (
                            <div key={item.stage} className="flex items-center gap-2 group">
                               <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <p className="text-sm font-medium">{item.stage}</p>
                                        <p className="text-sm font-bold">{item.count}</p>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full">
                                        <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${(item.count / maxPipelineCount) * 100}%` }}></div>
                                    </div>
                               </div>
                               {salesPipeline[index + 1] && (
                                    <MoveRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"/>
                               )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
