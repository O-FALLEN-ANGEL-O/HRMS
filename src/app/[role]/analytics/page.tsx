
'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, TrendingUp, Construction } from 'lucide-react';
import Image from 'next/image';


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

function EnhancedAnalyticsDashboard() {
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
          <h1 className="text-3xl font-bold font-headline tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Key metrics and visualizations for your role.</p>
       </div>
       <Suspense fallback={<LoadingState />}>
        {renderDashboard()}
       </Suspense>
    </div>
  );
}

    