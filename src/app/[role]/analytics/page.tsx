
'use client';

import React, { Suspense, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrendingDown, TrendingUp, Construction, BarChart, Users, FileText, MessageSquare, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnalyticsSidebar = () => (
    <aside className="hidden lg:flex lg:flex-col space-y-2">
         <Link href="#" className="flex items-center gap-3 rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
            <BarChart className="h-5 w-5" />
            Benchmarking
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <Users className="h-5 w-5" />
            Employee Management
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <FileText className="h-5 w-5" />
            Recruitment
        </Link>
         <div className="pt-4 mt-auto space-y-2">
            <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                <HelpCircle className="h-5 w-5" />
                Glossary & FAQ
            </Link>
             <Link href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                <MessageSquare className="h-5 w-5" />
                Give Feedback
            </Link>
        </div>
    </aside>
);

const BenchmarkingView = () => (
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
                     <div className="mt-6 h-96">
                        <Image alt="Bar chart comparing performance against benchmark" className="h-full w-full object-contain" src="https://placehold.co/800x400.png" width={800} height={400} data-ai-hint="bar chart"/>
                    </div>
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
);

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


const PerformanceMetricsView = () => (
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
                        <div className="h-48">
                            <Image src="https://placehold.co/400x200.png" alt="Line chart showing performance trends" width={400} height={200} className="w-full h-full object-contain" data-ai-hint="line chart"/>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Goals Achievement Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-40 items-center justify-center">
                             <div className="relative h-32 w-32">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                    <circle className="text-muted/20" cx="18" cy="18" r="15.9155" fill="none" strokeWidth="3"></circle>
                                    <circle className="text-primary" cx="18" cy="18" r="15.9155" fill="none" strokeWidth="3" strokeDasharray="85, 100" strokeLinecap="round"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold">85%</span>
                                    <span className="text-sm text-muted-foreground">Achieved</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
);


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
        return (
            <Tabs defaultValue="benchmarking" className="w-full">
                <TabsList>
                    <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
                    <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
                </TabsList>
                <TabsContent value="benchmarking" className="mt-6">
                    <BenchmarkingView />
                </TabsContent>
                <TabsContent value="performance" className="mt-6">
                    <PerformanceMetricsView />
                </TabsContent>
            </Tabs>
        )
      default:
        return <EmployeeDashboard />;
    }
  }

  return (
    <div className="grid lg:grid-cols-[250px_1fr] gap-8 items-start">
        <AnalyticsSidebar />
        <div className="space-y-6">
           <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Key metrics and visualizations for your role.</p>
           </div>
           <Suspense fallback={<LoadingState />}>
            {renderDashboard()}
           </Suspense>
        </div>
    </div>
  );
}
