
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Award, Cake, FileText, MoreHorizontal, Inbox, Gift, WavingHand, Search, Bell, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const celebrations = [
    { type: 'Birthday', icon: Cake, name: 'Ajay Jaleon Mas', avatar: `https://ui-avatars.com/api/?name=Ajay+Jaleon&background=random`, role: "Software Engineer" },
    { type: 'Birthday', icon: Cake, name: 'Kevin Fernandes', avatar: `https://ui-avatars.com/api/?name=Kevin+Fernandes&background=random`, role: "QA Engineer" },
    { type: 'Work Anniversary', icon: Award, name: 'Santhosh S M', avatar: `https://ui-avatars.com/api/?name=Santhosh+SM&background=random`, role: "3 years as Senior Designer" },
];

const wallOfFame = [
    { name: 'Rajesh thamayya a...', badges: 12, avatar: 'https://ui-avatars.com/api/?name=Rajesh+T&background=random' },
    { name: 'Thiyagu B', badges: 10, avatar: 'https://ui-avatars.com/api/?name=Thiyagu+B&background=random' },
    { name: 'Prajwal', badges: 8, avatar: 'https://ui-avatars.com/api/?name=Prajwal&background=random' },
    { name: 'Srehanth Kumar', badges: 4, avatar: 'https://ui-avatars.com/api/?name=Srehanth+K&background=random' },
];

const feedPost = {
    author: 'Divyashree',
    authorRole: 'Specialist',
    avatar: 'https://ui-avatars.com/api/?name=Divyashree&background=random',
    timestamp: '1 month ago',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 6, 19));

  const handleWish = (name: string) => {
    toast({
        title: "Wish Sent!",
        description: `Your good wishes have been sent to ${name}.`
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content (2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Highlights</h2>
                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                 <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-muted/50 rounded-xl">
                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Today's celebration</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">10 celebrations</p>
                    </div>
                    <MoreHorizontal className="text-gray-400" />
                </div>
                {celebrations.slice(0, 2).map((cel, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-muted/50">
                        <div className="flex items-center space-x-4">
                            <Avatar className="w-10 h-10">
                                <AvatarImage src={cel.avatar} alt={cel.name} data-ai-hint="person avatar"/>
                                <AvatarFallback>{cel.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{cel.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{cel.type} is today</p>
                            </div>
                        </div>
                        <Button variant="link" className="font-semibold" onClick={() => handleWish(cel.name)}>Wish</Button>
                    </div>
                ))}
                 <div className="text-center pt-2">
                    <Button variant="link" className="text-sm font-medium">See more</Button>
                </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-sm">
             <CardHeader className="flex flex-row items-start space-x-4 border-b pb-4">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={feedPost.avatar} alt={feedPost.author} data-ai-hint="person portrait" />
                    <AvatarFallback>{feedPost.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{feedPost.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feedPost.authorRole} • {feedPost.timestamp}</p>
                </div>
                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Featured</span>
             </CardHeader>
             <CardContent className="p-4">
                <p className="text-gray-600 dark:text-gray-300 mb-4">Employee Referral Program is Active!</p>
                <div className="bg-slate-800 text-white rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-2xl font-bold">Employee Referral Program</h3>
                        <p className="text-sm text-slate-300">1st July to 30th September</p>
                    </div>
                    <div className="bg-brand-blue p-4 text-center">
                        <p className="font-bold">Refer Now!</p>
                    </div>
                    <div className="p-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h4 className="font-bold text-lg mb-2">Hiring for Mangalore & Mysore</h4>
                            <ul className="text-sm space-y-2 text-slate-300 list-disc list-inside">
                                <li>Operations Manager</li>
                                <li>Team Leader</li>
                                <li>Senior Customer Service Associate</li>
                                <li>Junior Customer Service Associate</li>
                            </ul>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg mb-2">Top Referral Bonuses</h4>
                            <ul className="text-sm space-y-2 text-slate-300 list-disc list-inside">
                                <li>Earn a bonus of up to 10,000 INR on each successful referral.</li>
                                <li>The referred candidate must be employed for a minimum of 3 months.</li>
                            </ul>
                        </div>
                    </div>
                </div>
             </CardContent>
          </Card>

           <Card className="rounded-2xl shadow-sm">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Badge received</h2>
                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {wallOfFame.map((person, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <Avatar className="w-20 h-20 border-4 border-white dark:border-card shadow-md">
                                <AvatarImage src={person.avatar} alt={person.name} data-ai-hint="person avatar" />
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mt-2 truncate max-w-full">{person.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{person.badges} Badge</p>
                        </div>
                    ))}
                </div>
            </CardContent>
           </Card>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold">Welcome!</h2>
                    <WavingHand/>
                </div>
                <p className="mt-2 text-blue-100">Welcome to OptiTalent. We're thrilled to have you with us and look forward to your success and growth.</p>
                <div className="mt-4 flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4"/>
                    <span>1 people wished you</span>
                </div>
            </Card>

            <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Inbox</h2>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                        <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-full">
                            <Inbox className="text-purple-600 dark:text-purple-300"/>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">1</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending tasks</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Calendar</h2>
                        <Button variant="link" className="text-sm font-medium">Go to calendar</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-0"
                        classNames={{
                           day_selected: "bg-blue-600 text-white rounded-full focus:bg-blue-600 focus:text-white",
                           day_today: "bg-blue-100 text-blue-600 rounded-full"
                        }}
                    />
                    <div className="mt-4 flex flex-wrap items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2"><span className="w-2 h-2 bg-orange-400 rounded-full"></span><span>Today</span></div>
                        <div className="flex items-center space-x-2"><span className="w-2 h-2 bg-red-400 rounded-full"></span><span>Present</span></div>
                        <div className="flex items-center space-x-2"><span className="w-2 h-2 bg-gray-400 rounded-full"></span><span>Absent</span></div>
                        <div className="flex items-center space-x-2"><span className="w-2 h-2 bg-green-400 rounded-full"></span><span>Leave</span></div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
