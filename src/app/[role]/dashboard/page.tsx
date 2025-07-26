
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Award, Cake, FileText, MoreHorizontal, Inbox, Gift, Hand, Search, Bell, Settings, Users, MessageSquare, ThumbsUp, Share2, Lightbulb, CalendarDays } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';

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

const feedPost = {
    author: 'Divyashree',
    authorRole: 'Specialist',
    timestamp: '1 month ago',
    avatar: 'https://ui-avatars.com/api/?name=Divyashree&background=random',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 6, 25));

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Hello, {user?.profile.full_name.split(' ')[0] || 'There'}!</h1>
          <p className="text-gray-500 dark:text-gray-400">You are having a great day.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary w-64" placeholder="Search..." type="text"/>
          </div>
          <Button variant="outline" size="icon" className="rounded-full"><Bell/></Button>
          <Button variant="outline" size="icon" className="rounded-full"><Settings/></Button>
        </div>
      </header>

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
                            <AvatarImage src={feedPost.avatar} alt={feedPost.author} data-ai-hint="person portrait" />
                            <AvatarFallback>{feedPost.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex justify-between items-center w-full">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{feedPost.author}</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">People Operations</p>
                            <p className="text-xs text-gray-400 mt-1">{feedPost.timestamp}</p>
                        </div>
                         <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Featured</span>
                    </div>
                </CardHeader>
                <CardContent className="border-t pt-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-lg">Employee Referral Program is Active!</p>
                    <img alt="Employee Referral Program" data-ai-hint="employee referral" className="w-full rounded-lg" src="https://placehold.co/800x400.png" />
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
  );
}
