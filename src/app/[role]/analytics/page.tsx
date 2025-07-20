'use client';

import { useEffect, useState } from 'react';
import { AreaChart, BarChart, FileText, TrendingDown, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getDashboardDataAction } from './actions';
import type { DashboardData } from '@/ai/flows/get-dashboard-data';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';

const chartConfig = {
  count: { label: 'Employees', color: 'hsl(var(--chart-1))' },
  days: { label: 'Leave Days', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

function StatCard({ title, value, icon: Icon, isLoading }: { title: string; value: string | number; icon: React.ElementType; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const result = await getDashboardDataAction();
        setData(result);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: (error as Error).message,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-headline tracking-tight">HR Analytics</h1>
            <p className="text-muted-foreground">Key metrics and visualizations for workforce insights.</p>
        </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={data?.stats.totalEmployees ?? 0} icon={Users} isLoading={isLoading} />
        <StatCard title="Attrition Rate" value={`${data?.stats.attritionRate ?? 0}%`} icon={TrendingDown} isLoading={isLoading} />
        <StatCard title="Avg. Tenure" value={data?.stats.avgTenure ?? 'N/A'} icon={FileText} isLoading={isLoading} />
        <StatCard title="Hiring Pipeline" value={data?.stats.hiringPipeline ?? 0} icon={Briefcase} isLoading={isLoading} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Headcount by Department</CardTitle>
            <CardDescription>Distribution of employees across different departments.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={data?.headcountByDept} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="department" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave Trends</CardTitle>
            <CardDescription>Total leave days taken by employees over the past few months.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={data?.leaveTrends} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="days" stroke="var(--color-days)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>Candidate progression through the hiring stages.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
                <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart
                            layout="vertical"
                            data={data?.recruitmentFunnel}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                         >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="stage" type="category" width={80} />
                            <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent hideLabel />} />
                            <Legend />
                            <Bar dataKey="count" name="Candidates" fill="hsl(var(--chart-1))" background={{ fill: 'hsl(var(--muted))' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
