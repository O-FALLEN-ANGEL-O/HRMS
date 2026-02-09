

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { mockDashboardData } from '@/lib/mock-data/analytics';
import type { DashboardData } from '@/lib/types/analytics';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList, PieChart, Pie, Cell } from 'recharts';
import { getTicketSummaryAction } from './actions';
import type { TicketData } from '@/ai/flows/get-ticket-summary-flow.types';
import { kpiMap } from '@/lib/kpi-map';

const ProcessManagerDashboard = () => {
    const [data, setData] = useState<TicketData | null>(null);

    useEffect(() => {
        async function fetchData() {
            const result = await getTicketSummaryAction();
            setData(result);
        }
        fetchData();
    }, []);

    const chartData = data?.ticketSummary.map((item, index) => ({
        name: item.category,
        value: item.count,
        fill: `hsl(var(--chart-${index + 1}))`
    })) || [];
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ticket Volume by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
               {data ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                           {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                    </PieChart>
                </ResponsiveContainer>
               ) : <Skeleton className="w-full h-full" />}
            </CardContent>
        </Card>
    )
}

function LoadingState() {
  return (
      <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
              <Skeleton className="lg:col-span-3 h-96" />
              <Skeleton className="lg:col-span-2 h-96" />
          </div>
      </div>
  )
}

const HRAdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setData(mockDashboardData), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!user || !data) return <LoadingState />;

  const KpiComponent = kpiMap[user.role as keyof typeof kpiMap] || null;

  return (
    <>
      {KpiComponent && <Suspense fallback={<p>Loading KPIs...</p>}><KpiComponent /></Suspense>}
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5 mt-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Headcount by Department</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie data={data.headcountByDept} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                         {data.headcountByDept.map((entry, index) => <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />)}
                    </Pie>
                     <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>Current state of the hiring pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={350}>
                <FunnelChart>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                    <Funnel dataKey="count" data={data.recruitmentFunnel} isAnimationActive>
                        <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="stage" />
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  
  const hrRoles = ['admin', 'hr', 'recruiter', 'manager'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Key metrics and visualizations for your organization.</p>
        </div>
        <div className="flex items-center gap-2">
            <Select defaultValue="this-quarter">
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="this-quarter">This Quarter</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline">Customize</Button>
        </div>
      </div>
      
      {user?.role === 'process-manager' ? (
        <ProcessManagerDashboard />
      ) : hrRoles.includes(user?.role || '') ? (
        <HRAdminDashboard />
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            You do not have permission to view detailed analytics.
          </CardContent>
        </Card>
      )}

    </div>
  );
}
