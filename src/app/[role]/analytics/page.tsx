

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrendingDown, TrendingUp, BarChart, Users, FileText, MessageSquare, HelpCircle, TrendingUpIcon, BookOpen, Search, Flag, BrainCircuit, UserMinus, UserPlus, Clock, GraduationCap, Percent, Target, Briefcase, User as UserIcon, CheckCircle, Ticket, Building, DollarSign, Award, ClipboardCheck, Server, Package, Factory, AlertCircle, ShieldCheck, ClipboardList, Handshake, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart as RechartsBarChart, Bar as RechartsBar } from 'recharts';
import { getTicketSummaryAction } from './actions';
import type { TicketData } from '@/ai/flows/get-ticket-summary-flow.types';
import { DashboardCard } from '@/components/ui/dashboard-card';

type AnalyticsView = 'benchmarking' | 'performance' | 'demographics' | 'recruitment' | 'retention' | 'training' | 'glossary' | 'feedback' | 'individual';

const AnalyticsSidebar = ({ activeView, setActiveView }: { activeView: AnalyticsView, setActiveView: (view: AnalyticsView) => void }) => {
    const { user } = useAuth();
    if (!user) return null;

    const navItems = [
        { id: 'benchmarking', label: 'Benchmarking', icon: BarChart },
        { id: 'performance', label: 'Performance Metrics', icon: TrendingUpIcon },
        { id: 'individual', label: 'Individual Performance', icon: Target },
        { id: 'demographics', label: 'Employee Demographics', icon: Users },
        { id: 'recruitment', label: 'Recruitment Statistics', icon: UserPlus },
        { id: 'retention', label: 'Retention & Attrition', icon: Flag },
        { id: 'training', label: 'Training & Development', icon: GraduationCap },
    ];

    return (
        <aside className="hidden lg:flex lg:flex-col space-y-2">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as AnalyticsView)}
                    className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium w-full text-left",
                        activeView === item.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </button>
            ))}
            <div className="pt-4 mt-auto space-y-2">
                <button
                    onClick={() => setActiveView('glossary')}
                    className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium w-full text-left", activeView === 'glossary' ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                    <BookOpen className="h-5 w-5" />
                    Glossary & FAQ
                </button>
                <button
                     onClick={() => setActiveView('feedback')}
                     className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium w-full text-left", activeView === 'feedback' ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                    <MessageSquare className="h-5 w-5" />
                    Give Feedback
                </button>
            </div>
        </aside>
    )
};


const BenchmarkingView = () => {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setChartData([
                { name: 'Turnover', company: 8.2, benchmark: 10.5 },
                { name: 'Engagement', company: 85, benchmark: 78 },
                { name: 'Diversity', company: 65, benchmark: 70 },
                { name: 'Time to Hire', company: 45, benchmark: 40 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold">Benchmark Comparison</h3>
                    <div className="flex items-center gap-4">
                        <Button variant="outline">Update Data</Button>
                        <Button>Customize Comparison</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground" htmlFor="industry-select">Select Industry</label>
                        <Select defaultValue="technology">
                            <SelectTrigger id="industry-select" className="mt-1">
                                <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground" htmlFor="company-type-select">Select Company Type</label>
                         <Select defaultValue="public">
                            <SelectTrigger id="company-type-select" className="mt-1">
                                <SelectValue placeholder="Select Company Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Public Company</SelectItem>
                                <SelectItem value="private">Private Company</SelectItem>
                                <SelectItem value="startup">Startup</SelectItem>
                                <SelectItem value="non-profit">Non-profit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                    <p>Benchmark data sourced from IndustryPulse Analytics, updated quarterly. Reliability: High.</p>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Performance Overview vs. Benchmark</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-96" /> : (
                         <div className="mt-6 h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                  }}/>
                                <Legend />
                                <RechartsBar dataKey="company" fill="hsl(var(--primary))" name="OptiTalent" />
                                <RechartsBar dataKey="benchmark" fill="hsl(var(--muted-foreground))" name="Benchmark" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Employee Turnover Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div>
                                <p className="text-2xl font-bold text-primary">8.2%</p>
                                <p className="text-sm text-muted-foreground">OptiTalent</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-muted-foreground">10.5%</p>
                                <p className="text-sm text-muted-foreground">Benchmark</p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-green-600">
                            <TrendingDown className="mr-1 h-4 w-4" />
                            <span>2.3% Better than benchmark</span>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                       <CardTitle className="text-base font-semibold">Cost Per Hire</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div>
                                <p className="text-2xl font-bold text-primary">$4,500</p>
                                <p className="text-sm text-muted-foreground">OptiTalent</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-muted-foreground">$4,200</p>
                                <p className="text-sm text-muted-foreground">Benchmark</p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-red-600">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            <span>$300 Higher than benchmark</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Employee Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div>
                                <p className="text-2xl font-bold text-primary">85%</p>
                                <p className="text-sm text-muted-foreground">OptiTalent</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-muted-foreground">78%</p>
                                <p className="text-sm text-muted-foreground">Benchmark</p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-green-600">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            <span>7% Higher than benchmark</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
)};

const performanceData = [
  {
    name: "Olivia Martinez",
    email: "olivia.martinez@optitalent.com",
    avatar: "https://placehold.co/100x100?text=OM",
    score: "4.5 / 5.0",
    goals: "8 / 10",
    feedback: "Positive feedback on project delivery.",
  },
  {
    name: "Benjamin Carter",
    email: "benjamin.carter@optitalent.com",
    avatar: "https://placehold.co/100x100?text=BC",
    score: "4.8 / 5.0",
    goals: "10 / 10",
    feedback: "Exceeded all targets.",
  },
  {
    name: "Liam Rodriguez",
    email: "liam.rodriguez@optitalent.com",
    avatar: "https://placehold.co/100x100?text=LR",
    score: "3.9 / 5.0",
    goals: "6 / 10",
    feedback: "Needs improvement on communication.",
  },
];


const PerformanceMetricsView = () => {
    const [trendsData, setTrendsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setTrendsData([
                { name: 'Q1', score: 4.1 },
                { name: 'Q2', score: 4.3 },
                { name: 'Q3', score: 4.2 },
                { name: 'Q4', score: 4.5 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const goalData = [{ name: 'Achieved', value: 85, fill: 'hsl(var(--primary))' }, { name: 'Pending', value: 15, fill: 'hsl(var(--muted))' }];

    return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground" htmlFor="department">Department</label>
                        <Select defaultValue="all">
                            <SelectTrigger id="department" className="mt-1">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="hr">HR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground" htmlFor="manager">Manager</label>
                        <Select defaultValue="all">
                            <SelectTrigger id="manager" className="mt-1">
                                <SelectValue placeholder="Select Manager" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="all">All Managers</SelectItem>
                                <SelectItem value="jane-doe">Jane Doe</SelectItem>
                                <SelectItem value="john-smith">John Smith</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-muted-foreground" htmlFor="time-period">Time Period</label>
                        <Select defaultValue="last-quarter">
                            <SelectTrigger id="time-period" className="mt-1">
                                <SelectValue placeholder="Select Period" />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="last-quarter">Last Quarter</SelectItem>
                                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                                <SelectItem value="last-year">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button className="w-full">Apply Filters</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
             <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Performance Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Review Score</TableHead>
                                    <TableHead>Goals Achieved</TableHead>
                                    <TableHead>Feedback</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {performanceData.map(employee => (
                                    <TableRow key={employee.email}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={employee.avatar} data-ai-hint="person avatar"/>
                                                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{employee.name}</p>
                                                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.score}</TableCell>
                                        <TableCell>{employee.goals}</TableCell>
                                        <TableCell>{employee.feedback}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-48" /> : (
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 5]}/>
                                        <Tooltip contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                        }}/>
                                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Goals Achievement Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-40 items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={goalData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                                        {goalData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{
                                            backgroundColor: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                        }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
)};

const DemographicsView = () => {
    const [demographicsData, setDemographicsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setDemographicsData({
                byDept: [
                    { name: 'Engineering', value: 450, fill: 'hsl(var(--chart-1))' },
                    { name: 'Sales', value: 280, fill: 'hsl(var(--chart-2))' },
                    { name: 'Marketing', value: 180, fill: 'hsl(var(--chart-3))' },
                    { name: 'HR', value: 120, fill: 'hsl(var(--chart-4))' },
                    { name: 'Support', value: 224, fill: 'hsl(var(--chart-5))' },
                ],
                byAge: [
                    { name: '18-24', value: 250, fill: 'hsl(var(--chart-1))' },
                    { name: '25-34', value: 600, fill: 'hsl(var(--chart-2))' },
                    { name: '35-44', value: 300, fill: 'hsl(var(--chart-3))' },
                    { name: '45+', value: 104, fill: 'hsl(var(--chart-4))' },
                ]
            });
            setLoading(false);
        }, 1000);
    }, []);

    return (
    <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,254</div>
                    <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gender Ratio (M/F)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">60 / 40</div>
                    <p className="text-xs text-muted-foreground">60% Male, 40% Female</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Age</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">32.4</div>
                    <p className="text-xs text-muted-foreground">Years</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Tenure</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">4.2</div>
                    <p className="text-xs text-muted-foreground">Years</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Headcount by Department</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    {loading ? <Skeleton className="h-full w-full" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={demographicsData.byDept} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis type="number" />
                           <YAxis dataKey="name" type="category" width={80} />
                           <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                           <RechartsBar dataKey="value" name="Headcount" fill="hsl(var(--primary))" />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                     {loading ? <Skeleton className="h-full w-full" /> : (
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={demographicsData.byAge} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                               {demographicsData.byAge.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                        </PieChart>
                    </ResponsiveContainer>
                     )}
                </CardContent>
            </Card>
        </div>
    </div>
)};

const RetentionView = () => {
    const [retentionData, setRetentionData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setRetentionData([
                { name: 'Jan', Hires: 15, Departures: 5 },
                { name: 'Feb', Hires: 20, Departures: 7 },
                { name: 'Mar', Hires: 18, Departures: 4 },
                { name: 'Apr', Hires: 25, Departures: 8 },
                { name: 'May', Hires: 22, Departures: 6 },
                { name: 'Jun', Hires: 30, Departures: 10 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
  <div className="space-y-8">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
          <UserMinus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8.1%</div>
          <p className="text-xs text-muted-foreground">-1.2% from last quarter</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Tenure</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4.2 Years</div>
          <p className="text-xs text-muted-foreground">+0.3 years from last year</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Hires</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45</div>
          <p className="text-xs text-muted-foreground">This quarter</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Departures</CardTitle>
          <UserMinus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">21</div>
          <p className="text-xs text-muted-foreground">This quarter</p>
        </CardContent>
      </Card>
    </div>
    <Card>
        <CardHeader>
            <CardTitle>Turnover Trend</CardTitle>
            <CardDescription>Monthly new hires vs. departures over the last year.</CardDescription>
        </CardHeader>
        <CardContent className="h-96">
            {loading ? <Skeleton className="h-full w-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                    <Legend />
                    <Line type="monotone" dataKey="Hires" stroke="hsl(var(--primary))" />
                    <Line type="monotone" dataKey="Departures" stroke="hsl(var(--destructive))" />
                </LineChart>
            </ResponsiveContainer>
            )}
        </CardContent>
    </Card>
  </div>
)};

const TrainingView = () => {
    const [trainingData, setTrainingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setTrainingData([
                { name: 'Engineering', rate: 95 },
                { name: 'Sales', rate: 80 },
                { name: 'Marketing', rate: 88 },
                { name: 'Support', rate: 92 },
                { name: 'HR', rate: 98 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
     <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Training Programs Active</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">Across all departments</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Employee Participation</CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">Of eligible employees enrolled</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Performance Increase</CardTitle>
                    <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+12%</div>
                    <p className="text-xs text-muted-foreground">Post-training assessment scores</p>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Training Completion Rate by Department</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
                {loading ? <Skeleton className="h-full w-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={trainingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                        <RechartsBar dataKey="rate" name="Completion Rate" fill="hsl(var(--primary))" />
                    </RechartsBarChart>
                </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    </div>
)};

const funnelData = [
  { value: 1250, name: 'Applied', fill: 'hsl(var(--chart-1))' },
  { value: 680, name: 'Screening', fill: 'hsl(var(--chart-2))' },
  { value: 320, name: 'Interview', fill: 'hsl(var(--chart-3))' },
  { value: 150, name: 'Offer', fill: 'hsl(var(--chart-4))' },
  { value: 95, name: 'Hired', fill: 'hsl(var(--chart-5))' },
];

const sourceOfHireData = [
  { name: 'Referrals', value: 45, fill: 'hsl(var(--chart-1))'},
  { name: 'LinkedIn', value: 30, fill: 'hsl(var(--chart-2))'},
  { name: 'Job Portals', value: 15, fill: 'hsl(var(--chart-3))'},
  { name: 'Career Site', value: 10, fill: 'hsl(var(--chart-4))'},
];

const topRoles = [
    { title: 'Senior Backend Engineer', department: 'Engineering', applicants: 45 },
    { title: 'Product Designer', department: 'Design', applicants: 32 },
    { title: 'Marketing Manager', department: 'Marketing', applicants: 28 },
];

const RecruitmentView = () => (
    <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time to Fill</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">32 Days</div>
                    <p className="text-xs text-muted-foreground">Average across all roles</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cost Per Hire</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$4,150</div>
                    <p className="text-xs text-muted-foreground">-5% from last quarter</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Offer Acceptance Rate</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">88%</div>
                    <p className="text-xs text-muted-foreground">+3% from last quarter</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Hiring Funnel</CardTitle>
                    <CardDescription>Conversion rates through the hiring pipeline.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <FunnelChart>
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                            <Funnel dataKey="value" data={funnelData} isAnimationActive>
                                <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Source of Hire</CardTitle>
                    <CardDescription>Where our new hires are coming from.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={sourceOfHireData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                               {sourceOfHireData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Top Open Roles</CardTitle>
                <CardDescription>Roles with the highest number of active applicants.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Applicants</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topRoles.map(role => (
                            <TableRow key={role.title}>
                                <TableCell className="font-medium">{role.title}</TableCell>
                                <TableCell>{role.department}</TableCell>
                                <TableCell className="text-right">{role.applicants}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
);


const IndividualPerformanceView = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [loading, setLoading] = useState(false);
    const [employeeData, setEmployeeData] = useState<any>(null);
    const { toast } = useToast();

    const handleFetchData = () => {
        if (!employeeId) {
            toast({ title: 'Please enter an Employee ID or Name', variant: 'destructive' });
            return;
        }
        setLoading(true);
        setEmployeeData(null);
        setTimeout(() => {
            setEmployeeData({
                name: "Anika Sharma",
                id: "PEP0012",
                avatar: "https://placehold.co/100x100?text=AS",
                csat: 94,
                qualityScore: 92,
                resolutionTime: '15 mins',
                ratings: [
                    { name: 'Communication', value: 4.8 },
                    { name: 'Problem Solving', value: 4.5 },
                    { name: 'Product Knowledge', value: 4.7 },
                    { name: 'Empathy', value: 4.6 },
                ]
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Individual Employee Performance</CardTitle>
                    <CardDescription>Search for an employee to view their detailed performance metrics.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <Input
                        placeholder="Enter Employee ID or Name"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                    />
                     <Select defaultValue="monthly">
                        <SelectTrigger>
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFetchData} disabled={loading}>
                        {loading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />}
                        Fetch Data
                    </Button>
                </CardContent>
            </Card>

            {loading && <div className="text-center py-8"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>}
            
            {employeeData && (
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={employeeData.avatar} data-ai-hint="person avatar"/>
                                <AvatarFallback>{employeeData.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-xl">{employeeData.name}</CardTitle>
                                <CardDescription>{employeeData.id}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="grid gap-4 md:grid-cols-3">
                            <Card className="p-4">
                                <p className="text-sm text-muted-foreground">CSAT Score</p>
                                <p className="text-2xl font-bold">{employeeData.csat}%</p>
                            </Card>
                             <Card className="p-4">
                                <p className="text-sm text-muted-foreground">Quality Score</p>
                                <p className="text-2xl font-bold">{employeeData.qualityScore}%</p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm text-muted-foreground">Avg. Resolution</p>
                                <p className="text-2xl font-bold">{employeeData.resolutionTime}</p>
                            </Card>
                        </div>
                         <Card>
                            <CardHeader><CardTitle className="text-base">Rating Breakdown</CardTitle></CardHeader>
                            <CardContent className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={employeeData.ratings} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 5]} />
                                        <YAxis type="category" dataKey="name" width={100} />
                                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}/>
                                        <RechartsBar dataKey="value" fill="hsl(var(--primary))" />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </CardContent>
                    <CardFooter>
                        <Button>Download Report</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
};


function GlossaryView() {
    const glossaryTerms = [
        { term: 'Employee Turnover Rate', definition: 'The percentage of employees who leave an organization during a certain period. It is calculated by dividing the number of employees who left by the average number of employees.' },
        { term: 'Cost Per Hire', definition: 'The total cost associated with recruiting and hiring a new employee. This includes advertising costs, recruiter fees, and time spent on interviewing and onboarding.' },
        { term: 'Employee Engagement', definition: 'The extent to which employees feel passionate about their jobs, are committed to the organization, and put discretionary effort into their work.' },
    ];
    return (
        <Card>
            <CardHeader>
                <CardTitle>Glossary</CardTitle>
                <CardDescription>Definitions for HR terms used throughout the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <dl className="space-y-4">
                    {glossaryTerms.map(item => (
                        <div key={item.term}>
                            <dt className="font-semibold">{item.term}</dt>
                            <dd className="text-sm text-muted-foreground">{item.definition}</dd>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>
    );
}

function FeedbackView() {
    const { toast } = useToast();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Feedback Submitted",
            description: "Thank you for helping us improve the dashboard!",
        });
        (e.target as HTMLFormElement).reset();
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>Help us improve the dashboard. Share your suggestions or report a bug.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="feedback-category">Category</label>
                        <Select name="feedback-category" required>
                             <SelectTrigger id="feedback-category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="suggestion">General Suggestion</SelectItem>
                                <SelectItem value="bug">Bug Report</SelectItem>
                                <SelectItem value="data">Data Inaccuracy</SelectItem>
                                <SelectItem value="feature">Feature Request</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <label htmlFor="feedback-comment">Comments</label>
                        <Textarea id="feedback-comment" name="feedback-comment" placeholder="Describe your feedback in detail..." required rows={5}/>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit">Submit Feedback</Button>
                </CardFooter>
            </form>
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

// =================================================================
// BPO Role Specific Dashboards
// =================================================================

const ManagerDashboard = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Team Performance" value="92%" icon={TrendingUp} description="+3% from last month" />
            <DashboardCard title="Attrition Rate" value="4%" icon={UserMinus} description="This quarter" />
            <DashboardCard title="Pending Approvals" value="5" icon={ClipboardCheck} description="Leave & expense requests" />
            <DashboardCard title="Team Headcount" value="12" icon={Users} description="2 new hires" />
        </div>
        <Card>
            <CardHeader><CardTitle>Further manager-specific analytics would be displayed here...</CardTitle></CardHeader>
        </Card>
    </div>
);

const TeamLeadDashboard = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Shift Adherence" value="98%" icon={Clock} description="Real-time adherence" />
            <DashboardCard title="Avg. Handle Time" value="4m 15s" icon={Ticket} description="-5s from yesterday" />
            <DashboardCard title="Team QA Score" value="94.5%" icon={CheckCircle} description="This week's average" />
            <DashboardCard title="Escalations" value="2" icon={AlertCircle} description="Today" />
        </div>
         <Card>
            <CardHeader><CardTitle>A live team roster and daily attendance heatmap would be displayed here...</CardTitle></CardHeader>
        </Card>
    </div>
);


const RecruiterDashboard = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Active Openings" value="15" icon={Briefcase} description="Across all departments" />
            <DashboardCard title="Time to Hire" value="32 Days" icon={Clock} description="Average for last quarter" />
            <DashboardCard title="Offer Acceptance" value="88%" icon={Handshake} description="+3% from last quarter" />
            <DashboardCard title="New Applicants" value="+18" icon={UserPlus} description="This week" />
        </div>
        <Card>
            <CardHeader><CardTitle>A detailed application funnel and source of hire chart would go here...</CardTitle></CardHeader>
        </Card>
    </div>
);

const FinanceDashboard = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Monthly Burn" value="$125K" icon={DollarSign} description="Projected operational costs" />
            <DashboardCard title="Payroll Due" value="$250K" icon={Building} description="For this pay period" />
            <DashboardCard title="Pending Approvals" value="12" icon={ClipboardCheck} description="Expense reports & invoices" />
            <DashboardCard title="Compliance Flags" value="1" icon={AlertCircle} description="Potential audit risks" />
        </div>
        <Card>
            <CardHeader><CardTitle>Salary disbursement trends and overtime analysis would be shown here...</CardTitle></CardHeader>
        </Card>
    </div>
);

const TrainerDashboard = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Completion Rate" value="89%" icon={CheckCircle} description="For active training modules" />
            <DashboardCard title="Avg. Test Score" value="82%" icon={GraduationCap} description="Post-training assessments" />
            <DashboardCard title="Active Trainees" value="24" icon={Users} description="Across 3 batches" />
            <DashboardCard title="Pending Feedback" value="7" icon={MessageSquare} description="From recent sessions" />
        </div>
        <Card>
            <CardHeader><CardTitle>Improvement tracking and certification status would be displayed here...</CardTitle></CardHeader>
        </Card>
    </div>
);


const ItManagerDashboard = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="System Uptime" value="99.9%" icon={Server} description="Last 24 hours" />
            <DashboardCard title="Open Tickets" value="24" icon={Ticket} description="3 high priority" />
            <DashboardCard title="Security Alerts" value="7" icon={ShieldCheck} description="Last 7 days" />
            <DashboardCard title="Asset Inventory" value="512" icon={ClipboardList} description="Managed devices" />
        </div>
        <Card>
            <CardHeader><CardTitle>Downtime logs and common issue breakdowns would be displayed here...</CardTitle></CardHeader>
        </Card>
    </div>
);

const OperationsManagerDashboard = () => (
     <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Production Output" value="7,842 Units" icon={Package} description="Today's total" />
            <DashboardCard title="On-Time Delivery" value="96.2%" icon={TrendingUp} description="This week" />
            <DashboardCard title="Equipment Uptime" value="92.8%" icon={Factory} description="Across all lines" />
            <DashboardCard title="Safety Incidents" value="0" icon={AlertCircle} description="This month" />
        </div>
         <Card>
            <CardHeader><CardTitle>Department-wise AHT, CSAT, QA scores would be displayed here...</CardTitle></CardHeader>
        </Card>
    </div>
);

const QaDashboard = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Pending Evaluations" value="14" icon={ClipboardList} description="In your queue" />
            <DashboardCard title="Avg. Team Score" value="92.1%" icon={ShieldCheck} description="This month" />
            <DashboardCard title="Score Trend" value="+1.5%" icon={TrendingUp} description="Since last month" />
            <DashboardCard title="Coaching Sessions" value="5" icon={UserCheck} description="Completed this week" />
        </div>
         <Card>
            <CardHeader><CardTitle>Detailed score distribution and error type breakdowns would be displayed here...</CardTitle></CardHeader>
        </Card>
    </div>
);


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
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Open Tickets</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data ? data.ticketSummary.reduce((a, b) => a + b.count, 0) : <Skeleton className="h-8 w-16" />}</div>
                        <p className="text-xs text-muted-foreground">Across all departments</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2h</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.5%</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                         <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Open high-priority tickets</p>
                    </CardContent>
                </Card>
            </div>
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
        </div>
    )
}

const DefaultDashboard = ({ role }: { role: string }) => {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Default dashboard for the <span className="font-bold capitalize">{role.replace(/-/g, ' ')}</span> role.</CardDescription>
            </CardHeader>
             <CardContent>
                <p>Key metrics and visualizations for your role will be displayed here.</p>
            </CardContent>
        </Card>
    )
}

export default function AnalyticsPage() {
  const params = useParams();
  const role = params.role as string || 'employee';
  const [activeView, setActiveView] = useState<AnalyticsView>('benchmarking');

  const renderContent = () => {
    switch(activeView) {
      case 'benchmarking': return <BenchmarkingView />;
      case 'performance': return <PerformanceMetricsView />;
      case 'demographics': return <DemographicsView />;
      case 'recruitment': return <RecruitmentView />;
      case 'retention': return <RetentionView />;
      case 'training': return <TrainingView />;
      case 'glossary': return <GlossaryView />;
      case 'feedback': return <FeedbackView />;
      case 'individual': return <IndividualPerformanceView />;
      default: return <BenchmarkingView />;
    }
  };

  const getPageTitle = () => {
     switch(activeView) {
      case 'benchmarking': return 'Benchmarking';
      case 'performance': return 'Performance Metrics';
      case 'individual': return 'Individual Performance';
      case 'demographics': return 'Employee Demographics';
      case 'recruitment': return 'Recruitment Statistics';
      case 'retention': return 'Retention & Attrition';
      case 'training': return 'Training & Development';
      case 'glossary': return 'Glossary & FAQ';
      case 'feedback': return 'Give Feedback';
      default: return 'Analytics Dashboard';
    }
  }

  const renderRoleSpecificDashboard = () => {
    switch (role) {
        case 'admin':
        case 'hr':
            return (
                <div className="grid lg:grid-cols-[250px_1fr] gap-8 items-start">
                    <AnalyticsSidebar activeView={activeView} setActiveView={setActiveView} />
                    <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold font-headline tracking-tight">{getPageTitle()}</h1>
                        <p className="text-muted-foreground">Key metrics and visualizations for your role.</p>
                    </div>
                    <Suspense fallback={<LoadingState />}>
                        {renderContent()}
                    </Suspense>
                    </div>
                </div>
            )
        case 'manager':
            return <ManagerDashboard />;
        case 'team-leader':
            return <TeamLeadDashboard />;
        case 'process-manager':
            return <ProcessManagerDashboard />;
        case 'qa-analyst':
            return <QaDashboard />;
        case 'recruiter':
            return <RecruiterDashboard />;
        case 'finance':
            return <FinanceDashboard />;
        case 'it-manager':
            return <ItManagerDashboard />;
        case 'operations-manager':
            return <OperationsManagerDashboard />;
        case 'account-manager':
             return <DefaultDashboard role={role} />
        case 'trainer':
            return <TrainerDashboard />;
        case 'employee':
        case 'trainee':
        default:
            return (
                <Card>
                    <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <BarChart className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Analytics Unavailable</h3>
                    <p className="text-muted-foreground text-sm max-w-md">The analytics dashboard is not available for your current role.</p>
                    </CardContent>
                </Card>
            )
    }
  }


  return (
    <Suspense fallback={<LoadingState />}>
        {renderRoleSpecificDashboard()}
    </Suspense>
  );
}
