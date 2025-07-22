
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Award, Badge, CalendarCheck, Cake, File, ThumbsUp, ChevronDown, UserPlus, Gift, Trophy, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { useRouter, useParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { EmployeeDetailsCard } from '@/components/employee-details-card';
import { motion } from 'framer-motion';
import { mockEmployees } from '@/lib/mock-data/employees';
import { addDays, subDays } from 'date-fns';

const quickActions = [
    { label: 'Post', icon: File },
    { label: 'Badge', icon: Badge },
    { label: 'Reward Point', icon: Award },
    { label: 'Endorse', icon: ThumbsUp },
];

const celebrations = [
    { type: 'Birthday', name: 'Anika Sharma' },
    { type: 'Work Anniversary', name: 'Rohan Verma (3 years)' },
];

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
    { rank: 1, name: 'Anika Sharma', awards: 15 },
    { rank: 2, name: 'Rohan Verma', awards: 12 },
    { rank: 3, name: 'Priya Mehta', awards: 9 },
]

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

  const isManager = role === 'manager' || role === 'hr' || role === 'admin';

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

  const handleWidgetAction = (title: string) => {
    toast({
      title: `${title} Widget Clicked`,
      description: `This would typically expand or navigate to a new page for ${title}.`,
    });
  };

  return (
    <div className="space-y-6">
       {searchedEmployee === null && !searching && (
         <Card className="bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg border-none overflow-hidden">
            <CardContent className="p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row justify-between items-start gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-headline tracking-tight font-bold capitalize">Hello, {role.replace(/-/g, ' ')}!</h1>
                        <p className="text-indigo-200 mt-1">Hope you are having a great day</p>
                    </div>
                    <div className="flex-shrink-0">
                        <Button 
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 border"
                            onClick={() => router.push(`/${role}/attendance`)}
                        >
                            Mark Attendance
                        </Button>
                        <p className="text-xs text-indigo-200 mt-1 text-right">Last punch: 18:00, Yesterday</p>
                    </div>
                </motion.div>
            </CardContent>
        </Card>
       )}
      
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
                    {quickActions.map(action => {
                        const Icon = action.icon;
                        return (
                            <Button key={action.label} variant="outline" className="h-20 flex-col gap-2" onClick={() => handleQuickAction(action.label)}>
                                <Icon className="h-6 w-6 text-primary" />
                                <span>{action.label}</span>
                            </Button>
                        );
                    })}
                </div>
                <DashboardCard title="Today's Celebration" icon={Cake} actionIcon={ChevronDown} onActionClick={() => handleWidgetAction("Today's Celebration")}>
                    <div className="space-y-3">
                        {celebrations.map((c, i) => <p key={i} className="text-sm text-muted-foreground">{c.type}: <span className="font-semibold text-foreground">{c.name}</span></p>)}
                    </div>
                </DashboardCard>
                <DashboardCard title="Core values" icon={Award} actionIcon={ChevronDown} onActionClick={() => handleWidgetAction('Core values')}>
                     <p className="text-sm text-muted-foreground">5 core values</p>
                </DashboardCard>
                <DashboardCard title="Referrals / IJP" icon={UserPlus} actionIcon={ChevronDown} onActionClick={() => handleWidgetAction('Referrals / IJP')}>
                     <p className="text-sm text-muted-foreground">3 referrals / IJP</p>
                </DashboardCard>
                <DashboardCard title="Team planned leaves" icon={CalendarCheck} actionIcon={ChevronDown} onActionClick={() => handleWidgetAction('Team planned leaves')}>
                    <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                        {teamLeaves.map(member => (
                            <Avatar key={member.name} className="w-8 h-8 border-2 border-background">
                                <AvatarImage src={member.avatar} data-ai-hint="person face" />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{teamLeaves.length} members</span>
                    </div>
                </DashboardCard>
                 <DashboardCard title="T20 Prediction League" icon={Trophy}>
                     <p className="text-sm text-muted-foreground">You have 10 wins and 2 losses.</p>
                </DashboardCard>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input name="search" placeholder="Search for an employee by name or ID..." className="pl-10 h-12" />
                </form>

                {searching ? (
                    <Card>
                        <CardContent className="p-6 text-center flex items-center justify-center h-48">
                           <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Searching...
                        </CardContent>
                    </Card>
                ) : searchedEmployee ? (
                   <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1}} transition={{ duration: 0.3 }}>
                     <EmployeeDetailsCard employee={searchedEmployee} />
                   </motion.div>
                ) : searchedEmployee === undefined ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                           <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                           <h3 className="mt-4 text-lg font-semibold">Employee Not Found</h3>
                           <p className="mt-1 text-sm text-muted-foreground">
                             The employee ID or name you searched for does not exist.
                           </p>
                        </CardContent>
                    </Card>
                ) : (
                  <Card>
                      <CardHeader>
                          <CardTitle>Feed</CardTitle>
                      </CardHeader>
                      <CardContent>
                           {posts.map((post) => (
                            <Card key={post.id}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                   <div className="flex items-center gap-4">
                                       <Avatar>
                                        <AvatarImage src={post.avatar} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-semibold">{post.author}</p>
                                        <p className="text-sm text-muted-foreground">{post.authorRole} • {post.timestamp}</p>
                                      </div>
                                   </div>
                                  <div className="flex items-center gap-2">
                                       {post.featured && <Badge>Featured</Badge>}
                                       <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground mb-4">{post.content}</p>
                                 {post.image && (
                                  <div className="rounded-lg overflow-hidden border">
                                      <img src={post.image} alt="Feed post" className="w-full h-auto object-cover" data-ai-hint={post.imageHint} />
                                  </div>
                                 )}
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                 <div className="flex gap-4 text-muted-foreground">
                                    <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                                      Like ({post.likes})
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)}>
                                      Comment ({post.comments})
                                    </Button>
                                 </div>
                                  <Button variant="link" onClick={() => router.push(`/${role}/company-feed`)}>See more</Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </CardContent>
                  </Card>
                )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
                {showBirthdayCard && (
                    <Card className="bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Gift className="h-6 w-6 text-yellow-700 dark:text-yellow-400"/>
                                <div>
                                    <p className="font-bold text-yellow-800 dark:text-yellow-200">Happy Birthday!</p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">15 people wished you</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800" onClick={() => setShowBirthdayCard(false)}>X</Button>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">Calendar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={new Date()}
                            modifiers={attendanceModifiers}
                            modifiersClassNames={{
                                present: 'rdp-day_present',
                                absent: 'rdp-day_absent',
                                'half-day': 'rdp-day_half-day',
                                holiday: 'rdp-day_holiday',
                                dayOff: 'rdp-day_dayOff'
                            }}
                            className="p-0"
                        />
                    </CardContent>
                    <CardFooter>
                        <Button variant="link" size="sm" className="w-full" onClick={() => router.push(isManager ? `/${role}/leaves/calendar` : `/${role}/leaves`)}>
                            Go to Calendar
                        </Button>
                    </CardFooter>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">Leave Balance</CardTitle>
                        <Button variant="link" size="sm" onClick={() => router.push(`/${role}/leaves`)}>See all</Button>
                    </CardHeader>
                    <CardContent className="flex justify-around items-center pt-2">
                        <div className="text-center">
                            <p className="text-3xl font-bold">7</p>
                            <p className="text-xs text-muted-foreground">Casual</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">2</p>
                            <p className="text-xs text-muted-foreground">Sick</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">4</p>
                            <p className="text-xs text-muted-foreground">Earned</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Awards</CardTitle>
                        <CardDescription>Top performers of the week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead className="text-right">Awards</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employeeAwards.map((emp) => (
                                    <TableRow key={emp.rank}>
                                        <TableCell className="font-bold">{emp.rank}</TableCell>
                                        <TableCell>{emp.name}</TableCell>
                                        <TableCell className="text-right">{emp.awards}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
      </div>
    </div>
  );
}
