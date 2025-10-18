
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ThumbsUp, Share2, Lightbulb, CalendarDays, ArrowRight, Search, Bell, MoreHorizontal, Grid2X2, Clock, CheckCircle, Wallet, Newspaper, LogOut, Home, User, Users, MessageSquare, Download, FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Briefcase, Plus, UserPlus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useParams, useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const kpiData = [
    { title: 'Headcount', value: '120', change: '+5%', changeType: 'increase' as const },
    { title: 'Active Agents', value: '100', change: '+2%', changeType: 'increase' as const },
    { title: 'Avg AHT', value: '5:30', change: '-1%', changeType: 'decrease' as const },
    { title: 'FCR', value: '85%', change: '+3%', changeType: 'increase' as const },
    { title: 'CSAT', value: '92%', change: '+1%', changeType: 'increase' as const },
    { title: 'Trainee Pass Rate', value: '95%', change: '+2%', changeType: 'increase' as const },
];

const performanceChartData = [
  { name: 'Jan', performance: 65 },
  { name: 'Feb', performance: 59 },
  { name: 'Mar', performance: 80 },
  { name: 'Apr', performance: 81 },
  { name: 'May', performance: 56 },
  { name: 'Jun', performance: 55 },
  { name: 'Jul', performance: 40 },
  { name: 'Aug', performance: 65 },
  { name: 'Sep', performance: 72 },
  { name: 'Oct', performance: 85 },
  { name: 'Nov', performance: 92 },
  { name: 'Dec', performance: 90 },
];

const recentEvents = [
    { icon: UserPlus, text: 'New hire, Alex, joined the team', time: '2 hours ago' },
    { icon: FileText, text: 'Job posting for Customer Support Specialist created', time: '4 hours ago' },
    { icon: Briefcase, text: 'Course \'Effective Communication\' updated', time: '6 hours ago' },
];


const WelcomePopup = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="text-2xl font-headline">🎉 Welcome to OptiTalent!</DialogTitle>
                <DialogDescription>
                    We're thrilled to have you on board. Here are some important documents to get you started.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
                <Button variant="outline" className="w-full justify-between">
                    <span>HR Handbook</span>
                    <Download className="h-4 w-4" />
                </Button>
                 <Button variant="outline" className="w-full justify-between">
                    <span>Code of Conduct</span>
                    <Download className="h-4 w-4" />
                </Button>
                 <Button variant="outline" className="w-full justify-between">
                    <span>IT Security Policy</span>
                    <Download className="h-4 w-4" />
                </Button>
            </div>
            <DialogFooter>
                <Button onClick={() => onOpenChange(false)}>Got it, thanks!</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);


const KpiCard = ({ title, value, change, changeType }: { title: string, value: string, change: string, changeType: 'increase' | 'decrease' }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold">{value}</div>
            <p className={cn("text-xs", changeType === 'increase' ? 'text-green-600' : 'text-red-600')}>
                {change}
            </p>
        </CardContent>
    </Card>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const handleQuickAction = (action: string) => {
        toast({ title: 'Action Triggered', description: `This would normally ${action.toLowerCase()}.`})
    }
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {user?.profile.full_name.split(' ')[0] || 'User'}!</p>
                </div>
            </div>

            {/* Key Performance Indicators */}
            <div>
                <h2 className="text-lg font-semibold mb-2">Key Performance Indicators</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Performance */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Overall Performance</CardTitle>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold">90%</p>
                            <p className="text-sm text-green-600">+5% Last 30 Days</p>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                    }}
                                />
                                <Line type="monotone" dataKey="performance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Quick Actions & System Health */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start" onClick={() => handleQuickAction('Create Role')} variant="outline">Create Role</Button>
                            <Button className="w-full justify-start" onClick={() => handleQuickAction('Create Job')} variant="outline">Create Job</Button>
                            <Button className="w-full justify-start" onClick={() => handleQuickAction('Create Course')} variant="outline">Create Course</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-muted-foreground">System Uptime</span>
                                <span className="font-semibold">75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                        </CardContent>
                    </Card>
                </div>
            </div>

             {/* Recent Events & Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Recent Events</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentEvents.map((event, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="p-3 bg-muted rounded-full">
                                        <event.icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{event.text}</p>
                                        <p className="text-xs text-muted-foreground">{event.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    <EmployeeDashboard showHeader={false} />
                </div>
            </div>
        </div>
    )
};


const EmployeeDashboard = ({ showHeader = true }: { showHeader?: boolean }) => {
    const { user } = useAuth();
    if (!user) return null;

    const feedPosts = [
    {
        author: 'Divyashree',
        authorRole: 'Specialist',
        timestamp: '1 month ago',
        avatar: 'https://ui-avatars.com/api/?name=Divyashree&background=random',
        title: 'Employee Referral Program is Active!',
        image: 'https://placehold.co/800x400.png',
        imageHint: 'employee referral program'
    },
    {
        author: 'Jackson Lee',
        authorRole: 'Head of HR',
        timestamp: '2 months ago',
        avatar: 'https://ui-avatars.com/api/?name=Jackson+Lee&background=random',
        title: 'Annual Company Retreat Location Announced!',
        image: 'https://placehold.co/800x400.png',
        imageHint: 'company retreat beach'
    }
];

    return (
        <div className="space-y-6">
            {showHeader && (
                <header className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.profile.profile_picture_url} />
                            <AvatarFallback>{user.profile.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-lg">Hello, {user.profile.full_name.split(' ')[0]}!</p>
                            <p className="text-sm text-muted-foreground">Welcome back</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="icon"><Search className="h-5 w-5"/></Button>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5"/>
                            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
                        </Button>
                    </div>
                </header>
            )}
            
            <Card>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm">Profile Completion</span>
                        <span className="text-sm font-bold text-primary">12.5%</span>
                    </div>
                    <Progress value={12.5} className="h-2" />
                    <Link href={`/${user.role}/profile`} className="text-sm text-primary font-medium mt-3 inline-flex items-center">
                        Complete your profile <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </CardContent>
            </Card>
            
            <Tabs defaultValue="feed" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="feed">Feed</TabsTrigger>
                    <TabsTrigger value="fame">Wall of Fame</TabsTrigger>
                </TabsList>
                <TabsContent value="feed" className="space-y-4">
                    {feedPosts.map((post, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row justify-between items-start p-4">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={post.avatar} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{post.author}</p>
                                        <p className="text-xs text-muted-foreground">{post.authorRole} • {post.timestamp}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </CardHeader>
                            <CardContent className="px-4 pb-4 space-y-3">
                                <p className="font-semibold leading-snug">{post.title}</p>
                                <Image 
                                    alt={post.title} 
                                    data-ai-hint={post.imageHint} 
                                    className="w-full rounded-lg aspect-video object-cover" 
                                    width={800} height={400} 
                                    src={post.image} />
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
                <TabsContent value="fame">
                    <Card>
                      <CardContent className="p-4">
                        <p>Wall of fame would be shown here.</p>
                      </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </div>
    )
}

export default function DashboardPage() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const params = useParams();
  const { user } = useAuth();
  const role = user?.role || 'employee';

  useEffect(() => {
    // This effect runs only once on mount
    if (sessionStorage.getItem('isNewUser') === 'true') {
        setShowWelcomePopup(true);
        sessionStorage.removeItem('isNewUser');
    }
  }, [Object.assign({}, params)]);

  const dataIntensiveRoles = ['admin', 'hr', 'manager', 'team-leader', 'process-manager', 'qa-analyst', 'recruiter'];
  const showAdminDashboard = dataIntensiveRoles.includes(role);

  return (
    <>
        <WelcomePopup open={showWelcomePopup} onOpenChange={setShowWelcomePopup} />
        {showAdminDashboard ? <AdminDashboard /> : <EmployeeDashboard />}
    </>
  );
}

    