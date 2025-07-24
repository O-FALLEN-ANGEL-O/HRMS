

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardDataAction } from './actions';
import type { DashboardData } from "@/ai/flows/get-dashboard-data.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Briefcase, TrendingUp, TrendingDown, Bot, Loader2, AlertTriangle, RefreshCw, Construction } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';


const loadingMessages = [
    "Connecting to data warehouse...",
    "Compiling HR records...",
    "Running statistical models...",
    "Analyzing leave patterns...",
    "Projecting recruitment funnel...",
    "Generating visualizations...",
];

function LoadingState({ hasError, onRetry }: { hasError: boolean, onRetry: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (!hasError) {
      intervalId = setInterval(() => {
        setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [hasError]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasError) {
      timer = setTimeout(() => setShowRetry(true), 3000);
    }
    return () => clearTimeout(timer);
  }, [hasError]);

  if (hasError) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
            <p className="text-muted-foreground mb-4">There was an issue fetching the dashboard data.</p>
            {showRetry && (
                <Button onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
            )}
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="relative mb-6">
            <div className="custom-loader"></div>
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
    const [error, setError] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await getDashboardDataAction();
            if (!result) throw new Error("No data returned");
            setData(result);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    if (loading || error) {
        return <LoadingState hasError={error} onRetry={fetchData} />;
    }
    
    if (!data) {
       return <LoadingState hasError={true} onRetry={fetchData} />;
    }
    
    const { stats, headcountByDept, recruitmentFunnel } = data;
    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

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
                              label={renderCustomizedLabel}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="stage"
                            >
                              {recruitmentFunnel.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend/>
                          </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function EmployeeDashboard() {
  return (
    <Card>
      <CardContent className="p-10 flex flex-col items-center justify-center text-center">
        <Construction className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Analytics Not Available</h3>
        <p className="text-muted-foreground text-sm">A dedicated analytics dashboard for your role is coming soon.</p>
      </CardContent>
    </Card>
  )
}


export default function AnalyticsPage() {
  const params = useParams();
  const role = params.role as string || 'employee';

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
      case 'hr':
      case 'manager':
      case 'recruiter':
      case 'process-manager':
      case 'team-leader':
        return <EnhancedAnalyticsDashboard />;
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
