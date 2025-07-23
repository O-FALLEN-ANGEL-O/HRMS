
'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Award, Cake, File, ThumbsUp, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { mockEmployees } from '@/lib/mock-data/employees';
import { addDays, subDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LeaderboardCard } from '@/components/leaderboard-card';

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


const quickActions = [
    { label: 'Post', icon: File },
    { label: 'Badge', icon: Award },
    { label: 'Reward Point', icon: ThumbsUp },
    { label: 'Endorse', icon: ThumbsUp },
];

const celebrations = [
    { type: 'Birthday', name: 'Anika Sharma' },
    { type: 'Work Anniversary', name: 'Rohan Verma (3 years)' },
];

const upcomingPrograms = [
    { name: 'Quarterly Town Hall', date: 'In 2 days' },
    { name: 'Tech Talk: AI in HR', date: 'Next Wednesday' },
]

const teamLeaves = [
    { name: 'Priya Mehta', avatar: 'https://placehold.co/100x100?text=PM' },
    { name: 'John Doe', avatar: 'https://placehold.co/100x100?text=JD' },
];

const initialPosts = [
  {
    id: '1',
    author: 'Kamal Hassan',
    authorRole: 'Human Resource',
    avatar: 'https://placehold.co/100x100.png',
    content: 'Everyone faces "MONDAY BLUES" what if we make it a "MONDAY NEW" in approach to start the week with a positive attitude.',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'office yoga',
    timestamp: '2d ago',
    likes: 90,
    comments: 10,
    featured: true,
  },
];

const employeeAwards = [
    { rank: 1, empId: 'PEP0012', name: 'Anika Sharma', awards: 15, avatar: 'https://ui-avatars.com/api/?name=Anika+Sharma&background=random' },
    { rank: 2, empId: 'PEP0013', name: 'Rohan Verma', awards: 12, avatar: 'https://ui-avatars.com/api/?name=Rohan+Verma&background=random' },
    { rank: 3, empId: 'PEP0014', name: 'Priya Mehta', awards: 9, avatar: 'https://ui-avatars.com/api/?name=Priya+Mehta&background=random' },
];

const RoleSpecificKpis = ({ role }: { role: string }) => {
    switch (role) {
        case 'recruiter':
            return <RecruiterKpis />;
        case 'manager':
        case 'hr':
        case 'admin':
        case 'team-leader':
             return <ManagerKpis />;
        case 'finance':
            return <FinanceKpis />;
        case 'it-manager':
            return <ItManagerKpis />;
        case 'operations-manager':
            return <OperationsManagerKpis />;
        case 'qa-analyst':
            return <QaAnalystKpis />;
        case 'employee':
        case 'trainee':
        default:
            return <EmployeeKpis />;
    }
}


export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [showBirthdayCard, setShowBirthdayCard] = React.useState(true);
  const [posts, setPosts] = React.useState(initialPosts);
  const [searchedEmployee, setSearchedEmployee] = React.useState<any | null | undefined>(null);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const role = (params.role as string) || 'employee';

  const isManagerView = ['manager', 'hr', 'admin', 'team-leader', 'trainer'].includes(role);

  const today = new Date();
  const attendanceModifiers = {
    present: [subDays(today, 2), subDays(today, 3), subDays(today, 6)],
    absent: [subDays(today, 4)],
    'half-day': [subDays(today, 1)],
    holiday: [subDays(today, 10)],
    dayOff: [subDays(today, 5)]
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    if (!search) {
        setSearchedEmployee(null);
        return;
    }

    setSearching(true);
    setTimeout(() => { // Simulate network delay
        const result = mockEmployees.find(e => 
            e.full_name.toLowerCase().includes(search.toLowerCase()) ||
            e.employee_id.toLowerCase() === search.toLowerCase()
        );

        if (result) {
            setSearchedEmployee(result);
        } else {
            setSearchedEmployee(undefined); // Use undefined to signify not found
            toast({
                title: "Employee Not Found",
                description: `No employee found with the name or ID "${search}".`,
                variant: "destructive"
            });
        }
        setSearching(false);
    }, 500);
  }

  const handleQuickAction = (label: string) => {
    toast({
      title: 'Action Triggered',
      description: `You clicked on "${label}". This would open a new dialog or page.`,
    });
  };

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
    <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-3xl font-headline">Welcome Back!</h1>
            <p className="text-muted-foreground">Here's a snapshot of what's happening in your workspace today.</p>
        </div>

        {/* Role-specific KPIs */}
        <Suspense fallback={<Skeleton className="h-24 w-full" />}>
            <RoleSpecificKpis role={role} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee of the Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TooltipProvider>
                            <div className="space-y-2">
                                {employeeAwards.map(emp => (
                                    <LeaderboardCard
                                        key={emp.rank}
                                        rank={emp.rank}
                                        name={emp.name}
                                        empId={emp.empId}
                                        image={emp.avatar}
                                        awards={emp.awards}
                                        crown={emp.rank === 1 ? 'gold' : emp.rank === 2 ? 'silver' : 'bronze'}
                                        isExpanded={true}
                                    />
                                ))}
                            </div>
                        </TooltipProvider>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Celebrations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {celebrations.map((cel) => (
                        <div key={cel.name} className="flex items-center gap-3 text-sm">
                            <Cake className="h-4 w-4 text-pink-500" />
                            <div>
                                <p className="font-semibold">{cel.name}</p>
                                <p className="text-muted-foreground">{cel.type}</p>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Programs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {upcomingPrograms.map((program) => (
                        <div key={program.name} className="flex items-center justify-between text-sm">
                            <p className="font-semibold">{program.name}</p>
                            <p className="text-muted-foreground">{program.date}</p>
                        </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {quickActions.map(action => (
                            <Button key={action.label} variant="outline" onClick={() => handleQuickAction(action.label)}>
                                <action.icon className="h-4 w-4 mr-2" />
                                {action.label}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
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
                                <Button variant="ghost" size="icon" className="ml-auto"><MoreHorizontal/></Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">{post.content}</p>
                            {post.image && <img src={post.image} alt="Post image" className="rounded-lg" data-ai-hint={post.imageHint} />}
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

            {/* Right Column */}
            <div className="lg:col-span-3 space-y-6">
                {isManagerView && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Find Employee</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch}>
                            <div className="flex gap-2">
                                <Input name="search" placeholder="Search by name or ID" disabled={searching}/>
                                <Button type="submit" size="icon" disabled={searching}>
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                                </Button>
                            </div>
                            </form>
                        </CardContent>
                        {searchedEmployee && (
                            <CardFooter>
                                <Suspense fallback={<Skeleton className="h-48" />}>
                                    <EmployeeDetailsCard employee={searchedEmployee}/>
                                </Suspense>
                            </CardFooter>
                        )}
                        {searchedEmployee === undefined && (
                            <CardFooter>
                                <p className="text-sm text-muted-foreground">No employee found.</p>
                            </CardFooter>
                        )}
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="multiple"
                            selected={[today]}
                            modifiers={attendanceModifiers}
                            modifiersClassNames={{
                                present: 'rdp-day_present',
                                absent: 'rdp-day_absent',
                                'half-day': 'rdp-day_half-day',
                                holiday: 'rdp-day_holiday',
                                dayOff: 'rdp-day_dayOff',
                            }}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Team on Leave</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex -space-x-2">
                            {teamLeaves.map((member) => (
                            <Avatar key={member.name} className="border-2 border-background">
                                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person avatar"/>
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
