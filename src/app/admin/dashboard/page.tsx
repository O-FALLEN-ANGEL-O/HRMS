
"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Users, FileText, BarChart, Briefcase, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const quickStats = [
  { title: "Total Employees", value: "124", icon: Users, color: "text-blue-500", bgColor: "bg-blue-100" },
  { title: "Active Jobs", value: "8", icon: Briefcase, color: "text-green-500", bgColor: "bg-green-100" },
  { title: "Leave Requests", value: "5", icon: Calendar, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  { title: "Pending Tickets", value: "3", icon: AlertCircle, color: "text-red-500", bgColor: "bg-red-100" },
];

const recentApplicants = [
    { name: "John Doe", role: "Software Engineer", status: "Interview", avatar: "https://placehold.co/100x100?text=JD" },
    { name: "Jane Smith", role: "Product Manager", status: "Screening", avatar: "https://placehold.co/100x100?text=JS" },
    { name: "Peter Jones", role: "UX Designer", status: "Applied", avatar: "https://placehold.co/100x100?text=PJ" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin! Here's an overview of your organization.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Pipeline</CardTitle>
            <CardDescription>Recent applicants for open positions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentApplicants.map(applicant => (
                         <TableRow key={applicant.name}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={applicant.avatar} data-ai-hint="person avatar"/>
                                        <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{applicant.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{applicant.role}</TableCell>
                            <TableCell><Badge variant="secondary">{applicant.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">View</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Company Feed</CardTitle>
                <CardDescription>Recent announcements and updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/100x100?text=HR" data-ai-hint="organization logo"/>
                        <AvatarFallback>HR</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">Q3 Performance Reviews</p>
                        <p className="text-sm text-muted-foreground">Performance review cycle for Q3 has started. Please complete your self-assessment by EOD Friday.</p>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/100x100?text=CEO" data-ai-hint="person avatar"/>
                        <AvatarFallback>CEO</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">New Funding Round!</p>
                        <p className="text-sm text-muted-foreground">We're excited to announce we've closed our Series B funding round. Great things ahead!</p>
                        <span className="text-xs text-muted-foreground">4 days ago</span>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
