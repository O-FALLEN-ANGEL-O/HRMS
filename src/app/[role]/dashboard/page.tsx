
'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Award, Cake, FileText, ThumbsUp, MoreHorizontal, Search, Loader2, User, Building, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockEmployees } from '@/lib/mock-data/employees';
import { subDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';

const EmployeeDetailsCard = dynamic(() => import('@/components/employee-details-card').then(mod => mod.EmployeeDetailsCard), {
  loading: () => <Skeleton className="h-48" />,
  ssr: false,
});

const RecruiterKpis = dynamic(() => import('@/components/dashboards/kpi-cards/recruiter-kpis').then(mod => mod.RecruiterKpis), { ssr: false });
const ManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/manager-kpis').then(mod => mod.ManagerKpis), { ssr: false });
const EmployeeKpis = dynamic(() => import('@/components/dashboards/kpi-cards/employee-kpis').then(mod => mod.EmployeeKpis), { ssr: false });
const FinanceKpis = dynamic(() => import('@/components/dashboards/kpi-cards/finance-kpis').then(mod => mod.FinanceKpis), { ssr: false });
const ItManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/it-manager-kpis').then(mod => mod.ItManagerKpis), { ssr: false });
const OperationsManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/operations-manager-kpis').then(mod => mod.OperationsManagerKpis), { ssr: false });
const QaAnalystKpis = dynamic(() => import('@/components/dashboards/kpi-cards/qa-analyst-kpis').then(mod => mod.QaAnalystKpis), { ssr: false });
const ProcessManagerKpis = dynamic(() => import('@/components/dashboards/kpi-cards/process-manager-kpis').then(mod => mod.ProcessManagerKpis), { ssr: false });

const celebrations = [
    { type: 'Birthday', name: 'Anika Sharma', avatar: `https://ui-avatars.com/api/?name=Anika+Sharma&background=random`, role: "Software Engineer" },
    { type: 'Work Anniversary', name: 'Rohan Verma', avatar: `https://ui-avatars.com/api/?name=Rohan+Verma&background=random`, role: "3 years as QA Engineer" },
    { type: 'Birthday', name: 'Priya Mehta', avatar: `https://ui-avatars.com/api/?name=Priya+Mehta&background=random`, role: "Senior Designer" },
];

const initialPosts = [
  {
    id: '1',
    author: 'Divyashree',
    authorRole: 'HR Manager',
    avatar: 'https://ui-avatars.com/api/?name=Divyashree&background=random',
    content: 'The employee referral program is now active! Refer candidates for open positions in Mangalore & Mysore and earn exciting bonuses. Check the hiring details in the image and refer now!',
    image: 'https://placehold.co/1200x630/6366f1/ffffff',
    imageHint: 'hiring team employee referral',
    timestamp: 'Jun 20, 2025',
    likes: 152,
    comments: 18,
    featured: true,
  },
];


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

  const [posts, setPosts] = useState(initialPosts);

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };
  
  const handleComment = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, comments: p.comments + 1 } : p))
    );
  };


  return (
    <div className="space-y-4 md:space-y-6">
        <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold font-headline leading-tight">Hi {user?.profile.full_name.split(' ')[0] || 'There'}!</h1>
            <p className="text-muted-foreground hidden md:block">Here's a snapshot of what's happening in your workspace today.</p>
        </div>
        
        {/* Mobile View with Tabs */}
        <div className="md:hidden">
            <Tabs defaultValue="feed">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="feed">Feed</TabsTrigger>
                    <TabsTrigger value="widgets">Widgets</TabsTrigger>
                </TabsList>
                <TabsContent value="feed" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Celebrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Carousel>
                             <CarouselContent>
                                {celebrations.map((cel, index) => (
                                    <CarouselItem key={index} className="basis-1/2">
                                        <Card className="p-4">
                                            <div className="flex flex-col items-center text-center gap-2">
                                                <Avatar className="w-16 h-16">
                                                    <AvatarImage src={cel.avatar} alt={cel.name} data-ai-hint="person portrait"/>
                                                    <AvatarFallback>{cel.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{cel.name}</p>
                                                    <p className="text-xs text-muted-foreground">{cel.role}</p>
                                                </div>
                                                <Badge variant="secondary">{cel.type}</Badge>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                             </CarouselContent>
                           </Carousel>
                        </CardContent>
                    </Card>

                     {posts.map(post => (
                        <Card key={post.id} className="overflow-hidden">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-11 h-11">
                                        <AvatarImage src={post.avatar} data-ai-hint="person portrait"/>
                                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{post.author}</p>
                                        <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                    </div>
                                    {post.featured && <Badge className="ml-auto">★ Featured</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm font-semibold">Employee Referral Program is Active!</p>
                                {post.image && <img src={post.image} alt="Post image" className="rounded-lg aspect-video object-cover" data-ai-hint={post.imageHint} />}
                                <p className="text-sm text-muted-foreground">{post.content}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between bg-muted/50 p-3">
                                <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                                    <ThumbsUp className="mr-2 h-4 w-4" /> Like ({post.likes})
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)}>
                                    Comment ({post.comments})
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </TabsContent>
                <TabsContent value="widgets" className="space-y-4">
                     <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                        <RoleSpecificKpis role={role} />
                     </Suspense>
                     <Card>
                        <CardHeader><CardTitle>My Calendar</CardTitle></CardHeader>
                        <CardContent><Calendar mode="today" selected={new Date()} className="p-0" /></CardContent>
                     </Card>
                </TabsContent>
            </Tabs>
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
                <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                    <RoleSpecificKpis role={role} />
                </Suspense>
                 {posts.map(post => (
                    <Card key={post.id}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={post.avatar} data-ai-hint="person portrait"/>
                                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{post.author}</p>
                                    <p className="text-xs text-muted-foreground">{post.authorRole}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                     {post.featured && <Badge>★ Featured</Badge>}
                                    <Button variant="ghost" size="icon"><MoreHorizontal/></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold mb-4">Employee Referral Program is Active!</p>
                            {post.image && <img src={post.image} alt="Post image" className="rounded-lg mb-4" data-ai-hint={post.imageHint} />}
                             <p className="text-sm text-muted-foreground">{post.content}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="ghost" onClick={() => handleLike(post.id)}>
                                <ThumbsUp className="mr-2 h-4 w-4" /> Like ({post.likes})
                            </Button>
                            <Button variant="ghost" onClick={() => handleComment(post.id)}>
                                Comment ({post.comments})
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            <div className="md:col-span-4 lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Celebrations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {celebrations.map((cel, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={cel.avatar} alt={cel.name} data-ai-hint="person portrait"/>
                                <AvatarFallback>{cel.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{cel.name}</p>
                                <Badge variant="secondary" className="mt-1">{cel.type}</Badge>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>My Calendar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="today"
                            selected={new Date()}
                            className="p-0"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
