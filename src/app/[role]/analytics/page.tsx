
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TrendingDown, TrendingUp, Construction, BarChart, Users, FileText, MessageSquare, HelpCircle, TrendingUpIcon, BookOpen, Search, Flag, BrainCircuit } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type AnalyticsView = 'benchmarking' | 'performance' | 'demographics' | 'recruitment' | 'retention' | 'training' | 'glossary' | 'feedback';

const AnalyticsSidebar = ({ activeView, setActiveView }: { activeView: AnalyticsView, setActiveView: (view: AnalyticsView) => void }) => {
    const { user } = useAuth();
    if (!user) return null;

    const navItems = [
        { id: 'benchmarking', label: 'Benchmarking', icon: BarChart },
        { id: 'performance', label: 'Performance Metrics', icon: TrendingUpIcon },
        { id: 'demographics', label: 'Employee Demographics', icon: Users },
        { id: 'recruitment', label: 'Recruitment Statistics', icon: FileText },
        { id: 'retention', label: 'Retention Analysis', icon: Flag },
        { id: 'training', label: 'Training & Development', icon: BrainCircuit },
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

function ComingSoonView({ title, icon: Icon }: { title: string, icon: React.ElementType }) {
    return (
      <Card>
        <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Icon className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{title} Analytics</h3>
          <p className="text-muted-foreground text-sm max-w-md">A dedicated analytics dashboard for this section is under construction. Key metrics and visualizations for {title.toLowerCase()} will be available here soon.</p>
        </CardContent>
      </Card>
    )
}

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


export default function AnalyticsPage() {
  const params = useParams();
  const role = params.role as string || 'employee';
  const [activeView, setActiveView] = useState<AnalyticsView>('benchmarking');

  const renderContent = () => {
    switch(activeView) {
      case 'benchmarking': return <BenchmarkingView />;
      case 'performance': return <PerformanceMetricsView />;
      case 'demographics': return <ComingSoonView title="Employee Demographics" icon={Users} />;
      case 'recruitment': return <ComingSoonView title="Recruitment Statistics" icon={FileText} />;
      case 'retention': return <ComingSoonView title="Retention Analysis" icon={Flag} />;
      case 'training': return <ComingSoonView title="Training & Development" icon={BrainCircuit} />;
      case 'glossary': return <GlossaryView />;
      case 'feedback': return <FeedbackView />;
      default: return <BenchmarkingView />;
    }
  };

  const getPageTitle = () => {
     switch(activeView) {
      case 'benchmarking': return 'Benchmarking';
      case 'performance': return 'Performance Metrics';
      case 'demographics': return 'Employee Demographics';
      case 'recruitment': return 'Recruitment Statistics';
      case 'retention': return 'Retention Analysis';
      case 'training': return 'Training & Development';
      case 'glossary': return 'Glossary & FAQ';
      case 'feedback': return 'Give Feedback';
      default: return 'Analytics Dashboard';
    }
  }


  const renderDashboard = () => {
    switch (role) {
      case 'admin':
      case 'hr':
      case 'manager':
      case 'recruiter':
      case 'process-manager':
      case 'team-leader':
        return (
            <div className="grid lg:grid-cols-[250px_1fr] gap-8 items-start">
                <AnalyticsSidebar activeView={activeView} setActiveView={setActiveView} />
                <div className="space-y-6">
                   <div>
                      <h1 className="text-3xl font-bold font-headline tracking-tight">{getPageTitle()}</h1>
                      <p className="text-muted-foreground">Key metrics and visualizations for your role.</p>
                   </div>
                   <React.Suspense fallback={<LoadingState />}>
                    {renderContent()}
                   </React.Suspense>
                </div>
            </div>
        )
      default:
        return <ComingSoonView title="Analytics" icon={BarChart} />;
    }
  }

  return (
    <React.Suspense fallback={<LoadingState />}>
        {renderDashboard()}
    </React.Suspense>
  );
}

    