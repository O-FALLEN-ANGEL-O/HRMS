
'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Award, Cake, FileText, ThumbsUp, MoreHorizontal, Search, Loader2, User, Building, Briefcase, Inbox, Gift, Bot, Sparkles, MessageSquare, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const RecruiterKpis = dynamic(() => import('@/components/dashboards/kpi-cards/recruiter-kpis').then(mod => mod.RecruiterKpis), { ssr: false });
const ManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/manager-kpis').then(mod => mod.ManagerKpis), { ssr: false });
const EmployeeKpis = dynamic(() => import('@/components/dashboards/kpi-cards/employee-kpis').then(mod => mod.EmployeeKpis), { ssr: false });
const FinanceKpis = dynamic(() => import('@/components/dashboards/kpi-cards/finance-kpis').then(mod => mod.FinanceKpis), { ssr: false });
const ItManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/it-manager-kpis').then(mod => mod.ItManagerKpis), { ssr: false });
const OperationsManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/operations-manager-kpis').then(mod => mod.OperationsManagerKpis), { ssr: false });
const QaAnalystKpis = dynamic(() => import('@/components/dashboards/kpi-cards/qa-analyst-kpis').then(mod => mod.QaAnalystKpis), { ssr: false });
const ProcessManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/process-manager-kpis').then(mod => mod.ProcessManagerKpis), { ssr: false });

const celebrations = [
    { type: 'Birthday', icon: Cake, name: 'Ajay Jaleon Mas', avatar: `https://ui-avatars.com/api/?name=Ajay+Jaleon&background=random`, role: "Software Engineer" },
    { type: 'Birthday', icon: Cake, name: 'Kevin Fernandes', avatar: `https://ui-avatars.com/api/?name=Kevin+Fernandes&background=random`, role: "QA Engineer" },
    { type: 'Work Anniversary', icon: Award, name: 'Santhosh S M', avatar: `https://ui-avatars.com/api/?name=Santhosh+SM&background=random`, role: "3 years as Senior Designer" },
];

const wallOfFame = [
    { name: 'Rajesh thamayya a...', badges: 13, avatar: 'https://ui-avatars.com/api/?name=Rajesh+T&background=random', rank: 1 },
    { name: 'Ramyashree', badges: 10, avatar: 'https://ui-avatars.com/api/?name=Ramyashree&background=random', rank: 2 },
    { name: 'Thrupthi', badges: 3, avatar: 'https://ui-avatars.com/api/?name=Thrupthi&background=random', rank: 3 },
];

const feedPost = {
    id: '1',
    author: 'Divyashree',
    authorRole: 'People Operations Specialist',
    avatar: 'https://ui-avatars.com/api/?name=Divyashree&background=random',
    content: 'The employee referral program is now active! Refer candidates for open positions in Mangalore & Mysore and earn exciting bonuses. Check the hiring details in the image and refer now!',
    image: 'https://placehold.co/1200x800',
    imageHint: 'hiring team employee referral',
    timestamp: '1 month ago',
    featured: true,
};

const RoleSpecificKpis = ({ role }: { role: string }) => {
    switch (role) {
        case 'recruiter': return <RecruiterKpis />;
        case 'manager':
        case 'hr':
        case 'admin':
        case 'team-leader': return <ManagerKpis />;
        case 'finance': return <FinanceKpis />;
        case 'it-manager': return <ItManagerKpis />;
        case 'operations-manager': return <OperationsManagerKpis />;
        case 'qa-analyst': return <QaAnalystKpis />;
        case 'process-manager': return <ProcessManagerKpis />;
        case 'employee':
        case 'trainee':
        default: return <EmployeeKpis />;
    }
}


export default function DashboardPage() {
  const { user } = useAuth();
  const params = useParams();
  const role = (params.role as string) || 'employee';
  const { toast } = useToast();

  const handleWish = (name: string) => {
    toast({
        title: "Wish Sent!",
        description: `Your good wishes have been sent to ${name}.`
    })
  }
  
  const [welcomeVisible, setWelcomeVisible] = useState(true);

  return (
    <div className="space-y-6">
        <Card className="bg-card">
            <CardContent className="p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold font-headline">Hello, {user?.profile.full_name.split(' ')[0] || 'There'}!</h1>
                        <p className="text-muted-foreground text-sm">Hope you are having a great day</p>
                    </div>
                    <div className="w-1/3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-muted-foreground">Profile</span>
                          <span className="text-xs font-bold text-primary">12.5%</span>
                        </div>
                        <Progress value={12.5} className="h-2" />
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Highlights</CardTitle>
                        <CardDescription>Today's celebrations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {celebrations.map((cel, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={cel.avatar} alt={cel.name} data-ai-hint="person portrait"/>
                                <AvatarFallback>{cel.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium">{cel.name}'s {cel.type === 'Birthday' ? 'birthday is' : 'anniversary is'} today</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary" onClick={() => handleWish(cel.name)}>Wish</Button>
                        </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Wall of Fame</CardTitle></CardHeader>
                    <CardContent className="flex justify-around items-end pt-4">
                        {wallOfFame.map((fame, index) => (
                             <div key={index} className="flex flex-col items-center gap-2 text-center">
                                <div className="relative">
                                    <Avatar className={`w-12 h-12 ${fame.rank === 1 ? 'w-16 h-16' : ''}`}>
                                        <AvatarImage src={fame.avatar} alt={fame.name} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{fame.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                     <Badge variant="secondary" className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs">{fame.rank === 1 ? '🥇' : fame.rank === 2 ? '🥈' : '🥉'}</Badge>
                                </div>
                                <p className="text-xs font-medium max-w-20 truncate mt-2">{fame.name}</p>
                                <p className="text-xs text-muted-foreground">{fame.badges} Badges</p>
                             </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Center Column */}
            <div className="lg:col-span-6 space-y-6">
                 <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={feedPost.avatar} data-ai-hint="person portrait"/>
                                <AvatarFallback>{feedPost.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{feedPost.author}</p>
                                <p className="text-xs text-muted-foreground">{feedPost.authorRole} • {feedPost.timestamp}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                 {feedPost.featured && <Badge>★ Featured</Badge>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold mb-2">Employee Referral Program is Active!</p>
                        <div className="relative mb-4">
                            <img src={feedPost.image} alt="Post image" className="rounded-lg aspect-video object-cover" data-ai-hint={feedPost.imageHint} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{feedPost.content}</p>
                        <Button className="w-full">Refer Now!</Button>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                         <Button variant="outline" size="sm"><ThumbsUp className="h-4 w-4 mr-2"/>Clap (35)</Button>
                         <Button variant="outline" size="sm"><MessageSquare className="h-4 w-4 mr-2"/>Comment</Button>
                         <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 hover:text-red-600"><Heart className="h-4 w-4"/></Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 space-y-6">
               {welcomeVisible && (
                    <Card className="bg-primary/10 border-primary/20">
                        <CardHeader className="flex flex-row items-start justify-between p-4">
                            <div className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-primary"/>
                                <CardTitle className="text-base text-primary">Welcome!</CardTitle>
                            </div>
                            <button onClick={() => setWelcomeVisible(false)} className="text-muted-foreground hover:text-foreground">&times;</button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm">We're thrilled to have you with us and look forward to your success and growth.</p>
                        </CardContent>
                    </Card>
               )}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Inbox</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                       <Inbox className="h-8 w-8 text-primary"/>
                       <div>
                         <p className="font-bold text-lg">1</p>
                         <p className="text-sm text-muted-foreground">Pending tasks</p>
                       </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle className="text-base">My Calendar</CardTitle>
                        <Button variant="link" size="sm" className="p-0 h-auto">Go to calendar</Button>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="today"
                            selected={new Date()}
                            className="p-0"
                        />
                         <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center pt-4 border-t mt-4 text-xs">
                            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span>Present</div>
                            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500"></span>Absent</div>
                            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"></span>Leave</div>
                            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500"></span>Holiday</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-accent/50 border-accent">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                           <Sparkles className="h-5 w-5 text-primary"/> Do you know?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Our AI assistant can help you mark attendance, apply for leave, and more. Just ask!</p>
                        <Button variant="outline" size="sm" className="mt-3 w-full">Ask OneAI</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
