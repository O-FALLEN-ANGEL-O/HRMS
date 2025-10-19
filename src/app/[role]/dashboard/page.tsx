
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ThumbsUp, Share2, Lightbulb, CalendarDays, ArrowRight, Search, Bell, MoreHorizontal, Grid2X2, Clock, CheckCircle, Wallet, Newspaper, LogOut, Home, User, Users, MessageSquare, Download, FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar as CalendarIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { format, getDay, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import dayjs from "dayjs";


// Function to generate mock attendance data for a given month and year
const generateAttendanceLog = (year: number, month: number) => {
    const log: Record<string, {
        status: 'Present' | 'Absent' | 'Leave' | 'Week Off' | 'Holiday' | 'Half Day';
    }> = {};

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayOfWeek = getDay(date); // Sunday is 0, Saturday is 6

        // Don't generate data for future days in the current month
        if (isCurrentMonth && day > today.getDate()) {
            continue;
        }

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            log[dateKey] = { status: 'Week Off' };
        } else if (day === 15) { 
            log[dateKey] = { status: 'Holiday' };
        } else if (day === 10) { 
            log[dateKey] = { status: 'Leave' };
        } else if (day === 18) { 
            log[dateKey] = { status: 'Absent' };
        } else if (isCurrentMonth && day === today.getDate()) {
            log[dateKey] = { status: 'Present' };
        } else if (day === 20) {
            log[dateKey] = { status: 'Half Day'};
        } else { 
             log[dateKey] = { status: 'Present' };
        }
    }
    return log;
};


const DesktopDashboard = () => {
    const [attendanceLog, setAttendanceLog] = useState<Record<string, any> | null>(null);
    
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(dayjs());

    useEffect(() => {
        setAttendanceLog(generateAttendanceLog(currentMonth.year(), currentMonth.month()));
    }, [currentMonth]);
    
    const startOfMonth = currentMonth.startOf("month").startOf("week");
    const endOfMonth = currentMonth.endOf("month").endOf("week");

    const days = [];
    let day = startOfMonth;
    while (day.isBefore(endOfMonth, "day") || day.isSame(endOfMonth, "day")) {
        days.push(day);
        day = day.add(1, "day");
    }

    const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
    const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));
    
    const dayStatusClasses: Record<string, string> = {
        'Present': 'bg-green-500',
        'Absent': 'bg-red-500',
        'Leave': 'bg-blue-500',
        'Holiday': 'bg-purple-500',
        'Week Off': 'bg-gray-400',
        'Half Day': 'bg-yellow-400',
    };
    
    const getDayStatus = (date: dayjs.Dayjs) => {
        if (!attendanceLog) return null;
        const dateKey = date.format('YYYY-MM-DD');
        return attendanceLog[dateKey]?.status;
    };


    return (
        <div className="hidden md:grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Company Feed</CardTitle>
                        <CardDescription>Latest news and announcements.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="person avatar"/>
                                        <AvatarFallback>JL</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">Jackson Lee</p>
                                        <p className="text-xs text-muted-foreground">Head of HR • 1 day ago</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="font-semibold leading-snug">Upcoming Holiday: Annual Company Retreat</p>
                                <Image alt="Company retreat" data-ai-hint="company retreat beach" className="w-full rounded-lg aspect-video object-cover" width={800} height={400} src="https://placehold.co/800x400.png" />
                            </CardContent>
                             <CardFooter className="flex justify-between">
                                <Button variant="ghost"><ThumbsUp className="mr-2 h-4 w-4"/> Like (74)</Button>
                                <Button variant="ghost"><MessageSquare className="mr-2 h-4 w-4"/> Comment (5)</Button>
                                 <Button variant="ghost"><Share2 className="mr-2 h-4 w-4"/> Share</Button>
                            </CardFooter>
                        </Card>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-6">
                 <Card>
                    <CardHeader className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            My Calendar
                        </CardTitle>
                        <div className="flex gap-1">
                            <Button onClick={prevMonth} variant="ghost" size="icon" className="h-7 w-7">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button onClick={nextMonth} variant="ghost" size="icon" className="h-7 w-7">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center font-medium text-zinc-700 dark:text-zinc-200 mb-2">
                            {currentMonth.format("MMMM YYYY")}
                        </div>
                        <div className="grid grid-cols-7 text-xs text-muted-foreground uppercase mb-1">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                <div key={d} className="text-center py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((dayItem, i) => {
                                const isToday = dayItem.isSame(dayjs(), "day");
                                const isSelected = dayItem.isSame(selectedDate, "day");
                                const isCurrentMonth = dayItem.isSame(currentMonth, "month");
                                const status = getDayStatus(dayItem);
                                
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(dayItem)}
                                        className={cn(
                                            `aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all duration-150`,
                                            isSelected ? "bg-primary text-primary-foreground font-semibold" :
                                            isToday ? "border border-primary text-primary font-medium" :
                                            isCurrentMonth ? "text-foreground" : "text-muted-foreground/50",
                                            "hover:bg-accent"
                                        )}
                                    >
                                        <span>{dayItem.date()}</span>
                                         {isCurrentMonth && status && (
                                            <div className={cn("w-2 h-2 rounded-full mt-0.5", dayStatusClasses[status])} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-4 text-xs text-muted-foreground">
                            {Object.entries(dayStatusClasses).map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-1"><div className={cn("w-2 h-2 rounded-full", value)}></div><span>{key}</span></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">Submit Expense Report</Button>
                        <Button variant="outline" className="w-full justify-start">Book Conference Room</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
};


const MobileDashboard = () => {
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
                        <p>Wall of fame would be shown here.</p>
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
      <div className="md:hidden">
        <MobileDashboard />
      </div>
      <DesktopDashboard />
    </>
  );
}

    
    

    

