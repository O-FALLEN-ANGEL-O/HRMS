
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, UserCheck, Check, X, MoveRight, FileText, Banknote, MoreHorizontal } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '../ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';

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

const initialContentApprovalQueue = [
    { id: 'C-001', title: 'Q3 Social Media Campaign Images', type: 'Social Media', submittedBy: 'Anika Sharma' },
    { id: 'C-002', title: 'New Product Launch Blog Post', type: 'Blog', submittedBy: 'Vikram Singh' },
];

const initialBudgetRequests = [
    { id: 'B-001', title: 'Q4 Social Media Push', amount: 5000, department: 'Digital Marketing' },
    { id: 'B-002', title: 'Summer Sale SEO', amount: 3500, department: 'Content' },
];

const salesPipeline = [
    { stage: 'Prospects', count: 120, color: 'bg-blue-500' },
    { stage: 'Qualified Leads', count: 85, color: 'bg-indigo-500' },
    { stage: 'Needs Analysis', count: 60, color: 'bg-purple-500' },
    { stage: 'Proposal Sent', count: 40, color: 'bg-pink-500' },
    { stage: 'Negotiation', count: 25, color: 'bg-rose-500' },
    { stage: 'Closed-Won', count: 15, color: 'bg-green-500' },
];

const initialTasks = {
    'To Do': [
        { id: 'task-1', content: 'Draft Q4 newsletter' },
        { id: 'task-2', content: 'Plan photoshoot for new product line' },
    ],
    'In Progress': [
        { id: 'task-3', content: 'A/B testing for landing page variants' },
    ],
    'Done': [
        { id: 'task-4', content: 'Published "Top 10 Marketing Trends" blog post' },
        { id: 'task-5', content: 'Finalized ad copy for Google Ads' },
    ]
}

type TaskStatus = 'To Do' | 'In Progress' | 'Done';

function TaskBoard() {
    const [tasks, setTasks] = useState(initialTasks);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, sourceStatus: TaskStatus) => {
        e.dataTransfer.setData("taskId", taskId);
        e.dataTransfer.setData("sourceStatus", sourceStatus);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
        const taskId = e.dataTransfer.getData("taskId");
        const sourceStatus = e.dataTransfer.getData("sourceStatus") as TaskStatus;

        if (sourceStatus === targetStatus) return;

        const taskToMove = tasks[sourceStatus].find(t => t.id === taskId);
        if (!taskToMove) return;
        
        const newTasks = { ...tasks };
        newTasks[sourceStatus] = newTasks[sourceStatus].filter(t => t.id !== taskId);
        newTasks[targetStatus] = [taskToMove, ...newTasks[targetStatus]];

        setTasks(newTasks);
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Task Board</CardTitle>
                <CardDescription>Drag and drop tasks to update their status.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(tasks) as TaskStatus[]).map(status => (
                    <div key={status} 
                         className="p-4 bg-muted/50 rounded-lg h-full min-h-[200px]"
                         onDrop={(e) => handleDrop(e, status)}
                         onDragOver={handleDragOver}
                    >
                        <h3 className="font-semibold mb-3">{status}</h3>
                        <div className="space-y-3">
                            {tasks[status].map(task => (
                                <div key={task.id}
                                     className="p-3 bg-card rounded-md shadow-sm cursor-grab"
                                     draggable
                                     onDragStart={(e) => handleDragStart(e, task.id, status)}
                                >
                                    <p className="text-sm">{task.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function MarketingDashboard() {
  const { toast } = useToast();
  const [contentQueue, setContentQueue] = useState(initialContentApprovalQueue);
  const [budgetRequests, setBudgetRequests] = useState(initialBudgetRequests);
  
  const handleApproval = (id: string, type: 'content' | 'budget', approved: boolean) => {
    if (type === 'content') {
        setContentQueue(prev => prev.filter(item => item.id !== id));
    } else {
        setBudgetRequests(prev => prev.filter(item => item.id !== id));
    }
    
    toast({
        title: `${type === 'content' ? 'Content' : 'Budget'} Request ${approved ? 'Approved' : 'Rejected'}`,
        description: `Request ${id} has been processed.`,
    });
  }

  const handleAssetDownload = (assetName: string) => {
      toast({
          title: "Asset Downloading",
          description: `${assetName} has started downloading.`
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

        <TaskBoard />
        
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Approval Queue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {contentQueue.map(item => (
                                    <div key={item.id} className="p-3 bg-muted rounded-md">
                                        <p className='font-medium text-sm'>{item.title}</p>
                                        <p className='text-xs text-muted-foreground'>by {item.submittedBy}</p>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <Button size="icon" variant="outline" className="h-7 w-7 border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleApproval(item.id, 'content', true)}><Check className="h-4 w-4"/></Button>
                                            <Button size="icon" variant="outline" className="h-7 w-7 border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => handleApproval(item.id, 'content', false)}><X className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                ))}
                                {contentQueue.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Queue is empty.</p>}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Budget Approvals</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-3">
                                {budgetRequests.map(item => (
                                    <div key={item.id} className="p-3 bg-muted rounded-md">
                                        <p className='font-medium text-sm'>{item.title}</p>
                                        <p className='text-xs text-muted-foreground'>Request: ${item.amount.toLocaleString()}</p>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <Button size="icon" variant="outline" className="h-7 w-7 border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleApproval(item.id, 'budget', true)}><Check className="h-4 w-4"/></Button>
                                            <Button size="icon" variant="outline" className="h-7 w-7 border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => handleApproval(item.id, 'budget', false)}><X className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                ))}
                                {budgetRequests.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No pending requests.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Marketing Assets</CardTitle>
                        <CardDescription>Quick access to brand materials.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => handleAssetDownload('Brand Guidelines')}>
                            <FileText className="mr-2 h-4 w-4" /> Brand Guidelines
                        </Button>
                        <Button variant="outline" onClick={() => handleAssetDownload('Logo Pack')}>
                            <FileText className="mr-2 h-4 w-4" /> Logo Pack
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
