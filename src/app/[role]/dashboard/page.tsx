
'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Award, Badge, CalendarCheck, Cake, File, ThumbsUp, ChevronDown, UserPlus, Gift, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { useRouter } from 'next/navigation';

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

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showBirthdayCard, setShowBirthdayCard] = React.useState(true);
  const name = user?.profile?.name || user?.email?.split('@')[0] || 'User';
  const role = user?.role || 'employee';

  const isManager = role === 'manager' || role === 'hr' || role === 'admin';

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg border-none">
        <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-headline tracking-tight">Hello, {name}!</h1>
                    <p className="text-indigo-200">Hope you are having a great day</p>
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
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                         <Button key={action.label} variant="outline" className="h-16 flex-col gap-1">
                            <Icon className="h-6 w-6 text-primary" />
                            <span>{action.label}</span>
                        </Button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <DashboardCard title="Today's Celebration" icon={Cake} actionIcon={ChevronDown}>
                    <div className="space-y-3">
                        {celebrations.map((c, i) => <p key={i} className="text-sm text-muted-foreground">{c.type}: <span className="font-semibold text-foreground">{c.name}</span></p>)}
                    </div>
                </DashboardCard>
                <DashboardCard title="Core values" icon={Award} actionIcon={ChevronDown}>
                     <p className="text-sm text-muted-foreground">5 core values</p>
                </DashboardCard>
                <DashboardCard title="Referrals / IJP" icon={UserPlus} actionIcon={ChevronDown}>
                     <p className="text-sm text-muted-foreground">3 referrals / IJP</p>
                </DashboardCard>
                <DashboardCard title="Team planned leaves" icon={CalendarCheck} actionIcon={ChevronDown}>
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
        </div>

        <div className="space-y-6">
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
                <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={new Date()}
                        className="p-0"
                    />
                    <div className="mt-4 flex justify-end">
                      <Button variant="link" size="sm" className="w-full" onClick={() => router.push(isManager ? `/${role}/leaves/calendar` : `/${role}/leaves`)}>
                          Go to Calendar
                      </Button>
                    </div>
                </CardContent>
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
        </div>
      </div>
    </div>
  );
}

