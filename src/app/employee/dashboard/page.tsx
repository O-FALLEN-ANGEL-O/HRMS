
"use client"

import * as React from 'react';
import {
  Activity,
  Calendar,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Briefcase,
  CheckCircle,
  Heart,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'

function QuickActionCard({ icon, title, description, buttonText }: { icon: React.ElementType, title: string, description: string, buttonText: string }) {
  const Icon = icon;
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button className="w-full">{buttonText}</Button>
      </CardContent>
    </Card>
  )
}

function FeedPost({ avatar, name, team, time, content, image, likes, comments }: { avatar: string, name: string, team: string, time: string, content: string, image?: string, likes: number, comments: number }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar} data-ai-hint="person avatar" />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{team} • {time}</p>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">{content}</p>
        {image && <Image src={image} width={600} height={400} alt="Feed image" className="rounded-lg border" data-ai-hint="illustration work" />}
      </CardContent>
      <div className="flex justify-between items-center p-4 pt-0 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{likes}</span>
        </div>
        <span>{comments} comments</span>
      </div>
      <div className="border-t p-2 flex gap-2">
        <Button variant="ghost" size="sm" className="w-full justify-center">
          <ThumbsUp className="mr-2 h-4 w-4" /> Like
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-center">
          <MessageSquare className="mr-2 h-4 w-4" /> Comment
        </Button>
      </div>
    </Card>
  )
}

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = React.useState('');

  React.useEffect(() => {
    const getGreeting = () => {
      const hours = new Date().getHours();
      if (hours < 12) return "Good morning";
      if (hours < 18) return "Good afternoon";
      return "Good evening";
    };
    setGreeting(getGreeting());
  }, []);

  const userName = user?.profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      <Card className="bg-primary text-primary-foreground border-0">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold font-headline">{greeting ? `${greeting}, ${userName}!` : `Welcome, ${userName}!`}</h1>
          <p className="text-primary-foreground/80">Here's what's happening today. Have a great and productive day.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
            <QuickActionCard icon={Calendar} title="Apply for Leave" description="Request time off for vacation or personal needs." buttonText="New Leave Request" />
            <QuickActionCard icon={Briefcase} title="My Assessments" description="Complete your pending skill and performance tests." buttonText="View Assessments" />
            <Card>
                <CardHeader>
                    <CardTitle>My Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="font-medium text-sm">Complete self-assessment</p>
                            <p className="text-xs text-muted-foreground">Due: 25 July, 2024</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-yellow-500" />
                        <div>
                            <p className="font-medium text-sm">Update emergency contacts</p>
                            <p className="text-xs text-muted-foreground">Due: 30 July, 2024</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Center Column */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Feed</CardTitle>
            </CardHeader>
            <CardContent>
                <FeedPost 
                    name="Kamal Hassan" 
                    team="Human Resource" 
                    time="2d ago"
                    avatar="https://placehold.co/100x100.png?text=KH"
                    content='Everyone faces "MONDAY BLUES" what if we make it a "MONDAY NEW" in approach to start the week with a positive attitude.'
                    image="https://placehold.co/600x400.png"
                    likes={90}
                    comments={10}
                />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
           <Card>
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Leave Balance</CardTitle>
              <Button variant="link" size="sm">See all</Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex justify-around text-center">
              <div>
                <p className="text-3xl font-bold">7</p>
                <p className="text-xs text-muted-foreground">Sick</p>
              </div>
               <div>
                <p className="text-3xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Casual</p>
              </div>
               <div>
                <p className="text-3xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Holidays</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-semibold">Independence Day</p>
                        <p className="text-sm text-muted-foreground">National Holiday</p>
                    </div>
                    <p className="font-mono text-sm">Aug 15</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
