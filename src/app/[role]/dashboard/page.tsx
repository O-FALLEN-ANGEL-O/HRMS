
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Award, Badge, CalendarCheck, Cake, File, ThumbsUp, ChevronDown, UserPlus, Gift, Trophy, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { useRouter, useParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { mockEmployees } from '@/lib/mock-data/employees';
import { addDays, subDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const EmployeeDetailsCard = dynamic(() => import('@/components/employee-details-card').then(mod => mod.EmployeeDetailsCard), {
  loading: () => <Skeleton className="h-48" />,
  ssr: false,
});
const ManagerDashboard = dynamic(() => import('@/components/dashboards/manager-dashboard'), { ssr: false });
const RecruiterDashboard = dynamic(() => import('@/components/dashboards/recruiter-dashboard'), {
  loading: () => <div className="space-y-6"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>,
  ssr: false,
});
const EmployeeDashboard = dynamic(() => import('@/components/dashboards/employee-dashboard'), { ssr: false });
const QaAnalystDashboard = dynamic(() => import('@/components/dashboards/qa-analyst-dashboard'), { ssr: false });
const ProcessManagerDashboard = dynamic(() => import('@/components/dashboards/process-manager-dashboard'), { ssr: false });
const TeamLeaderDashboard = dynamic(() => import('@/components/dashboards/team-leader-dashboard'), { ssr: false });
const MarketingDashboard = dynamic(() => import('@/components/dashboards/marketing-dashboard'), { ssr: false });
const FinanceDashboard = dynamic(() => import('@/components/dashboards/finance-dashboard'), { ssr: false });
const ItManagerDashboard = dynamic(() => import('@/components/dashboards/it-manager-dashboard'), { ssr: false });
const OperationsDashboard = dynamic(() => import('@/components/dashboards/operations-dashboard'), { ssr: false });



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

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
      case 'hr':
      case 'manager':
        return <ManagerDashboard />;
      case 'team-leader':
        return <TeamLeaderDashboard />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'qa-analyst':
        return <QaAnalystDashboard />;
      case 'process-manager':
        return <ProcessManagerDashboard />;
      case 'marketing':
        return <MarketingDashboard />;
      case 'finance':
        return <FinanceDashboard />;
      case 'it-manager':
        return <ItManagerDashboard />;
      case 'operations-manager':
        return <OperationsDashboard />;
      case 'employee':
      default:
        return <EmployeeDashboard />;
    }
  }

  return (
    <div className="space-y-6">
       <div>
          <h1 className="font-headline tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">An overview of your workspace and tools.</p>
       </div>
       {renderDashboard()}
    </div>
  );
}
