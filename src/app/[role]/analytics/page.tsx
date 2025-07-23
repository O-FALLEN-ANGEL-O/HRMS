

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardDataAction } from './actions';
import type { DashboardData } from "@/ai/flows/get-dashboard-data.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, TrendingUp, TrendingDown, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ManagerDashboard = dynamic(() => import('@/components/dashboards/manager-dashboard'));
const RecruiterDashboard = dynamic(() => import('@/components/dashboards/recruiter-dashboard'));
const EmployeeDashboard = dynamic(() => import('@/components/dashboards/employee-dashboard'));
const QaAnalystDashboard = dynamic(() => import('@/components/dashboards/qa-analyst-dashboard'));
const ProcessManagerDashboard = dynamic(() => import('@/components/dashboards/process-manager-dashboard'));
const TeamLeaderDashboard = dynamic(() => import('@/components/dashboards/team-leader-dashboard'));
const MarketingDashboard = dynamic(() => import('@/components/dashboards/marketing-dashboard'));
const FinanceDashboard = dynamic(() => import('@/components/dashboards/finance-dashboard'));
const ItManagerDashboard = dynamic(() => import('@/components/dashboards/it-manager-dashboard'));
const OperationsDashboard = dynamic(() => import('@/components/dashboards/operations-dashboard'));

const loadingMessages = [
    "Connecting to data warehouse...",
    "Compiling HR records...",
    "Running statistical models...",
    "Analyzing leave patterns...",
    "Projecting recruitment funnel...",
    "Generating visualizations...",
];

function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="relative mb-6">
            <Bot className="h-16 w-16 text-primary animate-pulse" />
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin absolute -top-2 -right-2" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Generating Your Analytics Dashboard</h2>
        <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="text-muted-foreground"
            >
              {loadingMessages[messageIndex]}
            </motion.p>
        </AnimatePresence>
    </div>
  )
}


function EnhancedAnalyticsDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getDashboardDataAction();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !data) {
        return <LoadingState />;
    }
    
    const { stats, headcountByDept, recruitmentFunnel } = data;
    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">Current active workforce</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attrition Rate</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.attritionRate}%</div>
                        <p className="text-xs text-muted-foreground">Employee turnover this year</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hiring Pipeline</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.hiringPipeline}</div>
                        <p className="text-xs text-muted-foreground">Active candidates</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Tenure</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgTenure}</div>
                        <p className="text-xs text-muted-foreground">Average employee loyalty</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Headcount by Department</CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={headcountByDept} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="department" type="category" width={80} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        border: '1px solid hsl(var(--border))',
                                    }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                     <CardHeader>
                        <CardTitle>Recruitment Funnel</CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                }}
                            />
                            <Pie
                              data={recruitmentFunnel}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="stage"
                            >
                              {recruitmentFunnel.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function AnalyticsPage() {
  const params = useParams();
  const role = params.role as string || 'employee';

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
      case 'hr':
      case 'manager':
        return <EnhancedAnalyticsDashboard />;
      case 'team-leader':
        return <TeamLeaderDashboard />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'qa-analyst':
        return <QaAnalystDashboard />;
      case 'process-manager':
        return <ProcessManagerDashboard />;
      case 'marketing':
        return <MarketingDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      case 'it-manager':
        return <ItManagerDashboard />;
      case 'operations-manager':
        return <OperationsDashboard />;
      case 'employee':
      default:
        return <EmployeeDashboard />;
    }
  }

  return (
    <div className="space-y-6">
       <div>
          <h1 className="font-headline tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Key metrics and visualizations for your role.</p>
       </div>
       {renderDashboard()}
    </div>
  );
}
