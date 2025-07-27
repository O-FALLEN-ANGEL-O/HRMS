
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Award, Cake, FileText, MoreHorizontal, Inbox, Gift, Hand, Search, Bell, Settings, Users, MessageSquare, ThumbsUp, Share2, Lightbulb, CalendarDays, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

const wallOfFame = [
    { name: 'Rajesh T.', empId: 'EMP009', badges: 12, avatar: 'https://ui-avatars.com/api/?name=Rajesh+T&background=random', crown: 'gold' },
    { name: 'Thiyagu B', empId: 'EMP010', badges: 10, avatar: 'https://ui-avatars.com/api/?name=Thiyagu+B&background=random', crown: 'silver' },
    { name: 'Prajwal', empId: 'EMP011', badges: 8, avatar: 'https://ui-avatars.com/api/?name=Prajwal&background=random', crown: 'bronze' },
];

const leaderboardList = [
    { rank: 4, name: 'Srehanth Kumar', badges: 4, avatar: 'https://ui-avatars.com/api/?name=Srehanth+K&background=random' },
    { rank: 5, name: 'Harshini K', badges: 2, avatar: 'https://ui-avatars.com/api/?name=Harshini+K&background=random' },
    { rank: 6, name: 'Praisy S Shetty', badges: 1, avatar: 'https://ui-avatars.com/api/?name=Praisy+S&background=random' },
]

const feedPosts = [
    {
        author: 'Divyashree',
        authorRole: 'Specialist',
        timestamp: '1 month ago',
        avatar: 'https://ui-avatars.com/api/?name=Divyashree&background=random',
        title: 'Employee Referral Program is Active!',
        image: 'https://placehold.co/800x400/A893E0/FFFFFF?text=Referrals',
        imageHint: 'employee referral program'
    },
    {
        author: 'Jackson Lee',
        authorRole: 'Head of HR',
        timestamp: '2 months ago',
        avatar: 'https://ui-avatars.com/api/?name=Jackson+Lee&background=random',
        title: 'Annual Company Retreat Location Announced!',
        image: 'https://placehold.co/800x400/E6E6FA/333333?text=Retreat',
        imageHint: 'company retreat beach'
    }
];

const DesktopDashboard = () => {
    const { user } = useAuth();
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    return (
        <div className="space-y-6">
       <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Hello, {user?.profile.full_name.split(' ')[0] || 'There'}!</h1>
          <p className="text-gray-500 dark:text-gray-400">You are having a great day.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {/* Left Column */}
        <div className="hidden xl:flex xl:flex-col space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Wall of Fame</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex justify-between items-center bg-gray-50 dark:bg-muted p-3 rounded-lg mb-4">
                        <h3 className="text-md font-semibold">Badge received</h3>
                        <span className="text-sm text-gray-500 dark:text-muted-foreground">This week</span>
                    </div>
                    <div className="flex justify-around items-center text-center mt-4">
                        {wallOfFame.map((person, index) => (
                             <div key={index}>
                                <Avatar className={`w-16 h-16 mx-auto border-2 ${person.crown === 'gold' ? 'border-yellow-400' : person.crown === 'silver' ? 'border-gray-400' : 'border-amber-600'}`}>
                                    <AvatarImage src={person.avatar} alt={person.name} data-ai-hint="person portrait" />
                                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="mt-2 font-semibold text-sm">{person.name}</p>
                                <p className="text-xs text-gray-500">{person.badges} Badge</p>
                            </div>
                        ))}
                    </div>
                    <ul className="mt-6 space-y-4">
                        {leaderboardList.map((person) => (
                            <li key={person.rank} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="font-bold text-sm">{person.rank}</span>
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={person.avatar} alt={person.name} data-ai-hint="person avatar" />
                                        <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm">{person.name}</p>
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">{person.badges}</span>
                            </li>
                        ))}
                    </ul>
                    <Link href="#" className="text-primary hover:underline mt-4 block text-center text-sm">See more</Link>
                </CardContent>
             </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Team planned leaves</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                     <CalendarDays className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                     <p className="text-gray-500 mt-2 text-sm">No planned leaves today</p>
                </CardContent>
             </Card>
        </div>

        {/* Main Content (Center) */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <div className="flex items-start space-x-4">
                        <Avatar className="w-14 h-14">
                            <AvatarImage src={feedPosts[0].avatar} alt={feedPosts[0].author} data-ai-hint="person portrait" />
                            <AvatarFallback>{feedPosts[0].author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex justify-between items-center w-full">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{feedPosts[0].author}</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">People Operations</p>
                            <p className="text-xs text-gray-400 mt-1">{feedPosts[0].timestamp}</p>
                        </div>
                         <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Featured</span>
                    </div>
                </CardHeader>
                <CardContent className="border-t pt-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-lg">{feedPosts[0].title}</p>
                    <Image alt={feedPosts[0].title} data-ai-hint={feedPosts[0].imageHint} className="w-full rounded-lg aspect-video object-cover" width={800} height={400} src={feedPosts[0].image} />
                     <div className="mt-6 flex justify-between items-center text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-6">
                            <Button variant="ghost" className="flex items-center space-x-2 text-gray-500 hover:text-primary">
                                <ThumbsUp className="h-5 w-5" />
                                <span className="font-medium">Like</span>
                            </Button>
                            <Button variant="ghost" className="flex items-center space-x-2 text-gray-500 hover:text-primary">
                                <MessageSquare className="h-5 w-5" />
                                <span className="font-medium">Comment</span>
                            </Button>
                        </div>
                        <Button variant="ghost" className="flex items-center space-x-2 text-gray-500 hover:text-primary">
                            <Share2 className="h-5 w-5" />
                            <span className="font-medium">Share</span>
                        </Button>
                    </div>
                     <div className="mt-4 border-t border-gray-200 dark:border-border pt-4">
                        <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={user?.profile.profile_picture_url} alt="User avatar" data-ai-hint="person avatar"/>
                                <AvatarFallback>{user?.profile.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Input className="w-full bg-gray-100 dark:bg-muted border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-primary text-sm" placeholder="Write a comment..." type="text"/>
                        </div>
                    </div>
                </CardContent>
           </Card>
        </div>

        {/* Right Sidebar (becomes main column on smaller screens) */}
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                    <h2 className="font-bold text-lg text-blue-800 dark:text-blue-200">Welcome!</h2>
                    <Hand className="text-blue-500" />
                </div>
                <p className="text-sm text-gray-700 dark:text-blue-200 mt-2">Welcome to OptiTalent. We're thrilled to have you with us and look forward to your success and growth.</p>
                <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600 dark:text-blue-300">
                    <Users className="h-4 w-4" />
                    <span>1 people wished you</span>
                </div>
            </div>
            
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Inbox</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                             <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-full">
                                <Inbox className="text-purple-600 dark:text-purple-300 h-5 w-5"/>
                            </div>
                            <div>
                                <p className="font-semibold">1</p>
                                <p className="text-sm text-gray-500">Pending tasks</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Calendar</h2>
                        <Button variant="link" className="text-sm font-medium p-0 h-auto" asChild><Link href={`/${user?.role}/attendance`}>Go to calendar</Link></Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-0"
                         classNames={{
                           day_selected: "bg-primary text-white rounded-full focus:bg-primary focus:text-white",
                           day_today: "bg-blue-100 dark:bg-blue-900 text-primary rounded-full"
                        }}
                    />
                     <div className="flex flex-wrap justify-between text-xs mt-4 gap-2">
                        <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-primary rounded-full"></span><span>Today</span></div>
                        <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span><span>Present</span></div>
                        <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></span><span>Leave</span></div>
                        <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span><span>Absent</span></div>
                        <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span><span>Holiday</span></div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start space-x-4">
                <Lightbulb className="text-3xl text-orange-500" />
                <div>
                    <h4 className="font-bold text-orange-800 dark:text-orange-200">Do you know?</h4>
                    <p className="text-sm text-gray-700 dark:text-orange-300 mt-1">Our HR Chatbot can answer most of your policy questions instantly. Give it a try!</p>
                </div>
            </div>
        </div>
      </div>
    </div>
    )
};


const MobileDashboard = () => {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <div className="space-y-6">
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
                        <ul className="space-y-4">
                            {wallOfFame.concat(leaderboardList).map((person, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="font-bold text-sm w-4">{index+1}</span>
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={person.avatar} alt={person.name} data-ai-hint="person avatar" />
                                            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm">{person.name}</p>
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">{person.badges} Badges</span>
                                </li>
                            ))}
                        </ul>
                      </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </div>
    )
}


export default function DashboardPage() {
  return (
    <>
        <div className="hidden md:block">
            <DesktopDashboard />
        </div>
        <div className="md:hidden">
            <MobileDashboard />
        </div>
    </>
  );
}
