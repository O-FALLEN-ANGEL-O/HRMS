
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileCheck2, Timer, UserCheck, ShieldCheck } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '../ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { getTicketSummaryAction } from '@/ai/flows/get-ticket-summary-flow';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';


const complianceData = [
    { name: 'GDPR Training', status: 'Completed', percentage: 100 },
    { name: 'Security Policies', status: 'In Progress', percentage: 85 },
    { name: 'Code of Conduct', status: 'Completed', percentage: 98 },
];

export default function ProcessManagerDashboard() {
  const [ticketData, setTicketData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTicketSummaryAction();
        setTicketData(data.ticketSummary);
      } catch (e) {
        toast({
          title: "Error fetching data",
          description: (e as Error).message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const chartConfig = ticketData ? ticketData.reduce((acc, entry) => {
    acc[entry.category] = { label: entry.category, color: COLORS[ticketData.indexOf(entry) % COLORS.length] };
    return acc;
  }, {}) : {};

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                title="Avg. Time to Hire"
                value="28 Days"
                description="Down 2 days from last quarter."
                icon={Timer}
            />
             <DashboardCard 
                title="Avg. Onboarding Time"
                value="4 Days"
                description="Process efficiency at 95%."
                icon={UserCheck}
            />
            <DashboardCard 
                title="Avg. Ticket Resolution"
                value="3.2 Hours"
                description="For IT and HR helpdesk tickets."
                icon={FileCheck2}
            />
            <DashboardCard 
                title="Compliance"
                value="94% Complete"
                description="Company-wide training completion."
                icon={ShieldCheck}
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Ticket Volume by Category</CardTitle>
                    <CardDescription>Breakdown of helpdesk tickets this month.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-[250px]">
                            <Skeleton className="h-[200px] w-[200px] rounded-full" />
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                                <Pie data={ticketData} dataKey="count" nameKey="category" innerRadius={60}>
                                {ticketData?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="category" />} />
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                    <CardDescription>Tracking mandatory company-wide process compliance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {complianceData.map(item => (
                        <div key={item.name} className="p-3 bg-muted/50 rounded-lg">
                           <div className='flex justify-between items-center mb-1'>
                             <p className="text-sm font-medium">{item.name}</p>
                             <p className="text-sm font-semibold">{item.percentage}%</p>
                           </div>
                           <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{width: `${item.percentage}%`}}></div>
                           </div>
                        </div>
                     ))}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
