"use client"

import * as React from 'react';
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  PlusCircle,
  Users,
  FileText,
  DollarSign,
  Flame,
} from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { predictBurnout } from "@/ai/flows/predict-burnout";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const hiringData = [
  { month: "Jan", hired: 5, applied: 60 },
  { month: "Feb", hired: 7, applied: 75 },
  { month: "Mar", hired: 6, applied: 80 },
  { month: "Apr", hired: 10, applied: 110 },
  { month: "May", hired: 8, applied: 95 },
  { month: "Jun", hired: 12, applied: 130 },
];

const recentActivities = [
    { name: "John Doe", activity: "Completed Onboarding", time: "2 min ago", avatar: "https://placehold.co/100x100?text=JD" },
    { name: "Jane Smith", activity: "Applied for Software Engineer", time: "10 min ago", avatar: "https://placehold.co/100x100?text=JS" },
    { name: "HR Bot", activity: "Generated 3 new candidate reports", time: "1 hour ago", avatar: "" },
    { name: "Alex Ray", activity: "Submitted performance review", time: "3 hours ago", avatar: "https://placehold.co/100x100?text=AR" },
];


function PredictBurnoutCard() {
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData(event.currentTarget);
    const input = {
      employeeFeedback: formData.get("employeeFeedback") as string,
      workload: formData.get("workload") as string,
      workEnvironment: formData.get("workEnvironment") as string,
      attendanceRecords: formData.get("attendanceRecords") as string,
    };

    try {
      const prediction = await predictBurnout(input);
      setResult(prediction);
    } catch (error) {
      toast({
        title: "Error predicting burnout",
        description: "An error occurred while communicating with the AI. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline"><Flame className="text-destructive"/> AI Burnout Prediction</CardTitle>
        <CardDescription>Assess employee burnout risk using AI analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeFeedback">Employee Feedback</Label>
              <Textarea id="employeeFeedback" name="employeeFeedback" placeholder="e.g., 'Feeling overwhelmed, deadlines are tight.'" required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workload">Workload Description</Label>
              <Textarea id="workload" name="workload" placeholder="e.g., 'Managing 5 projects, frequently working late.'" required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEnvironment">Work Environment</Label>
              <Textarea id="workEnvironment" name="workEnvironment" placeholder="e.g., 'High-pressure but supportive team.'" required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendanceRecords">Attendance Records</Label>
              <Textarea id="attendanceRecords" name="attendanceRecords" placeholder="e.g., '10 hours overtime weekly, 2 sick days last month.'" required/>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Analyzing...' : 'Predict Risk'}
          </Button>
        </form>
        {result && (
          <div className="mt-4 space-y-4 rounded-lg border bg-accent p-4">
            <h4 className="font-bold">Prediction Result:</h4>
            <p><strong>Risk Level:</strong> <Badge variant={result.burnoutRiskLevel === 'High' || result.burnoutRiskLevel === 'Critical' ? 'destructive' : 'default'}>{result.burnoutRiskLevel}</Badge></p>
            <div>
              <p><strong>Risk Factors:</strong></p>
              <ul className="list-disc pl-5 text-sm">
                {result.riskFactors.map((factor: string, i: number) => <li key={i}>{factor}</li>)}
              </ul>
            </div>
            <div>
              <p><strong>Recommendations:</strong></p>
              <ul className="list-disc pl-5 text-sm">
                {result.recommendations.map((rec: string, i: number) => <li key={i}>{rec}</li>)}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">1,204</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applicants</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">+235</div>
            <p className="text-xs text-muted-foreground">+12.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">12</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">$45,231.89</div>
            <p className="text-xs text-muted-foreground">Next cycle: July 30</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Hiring Overview</CardTitle>
            <CardDescription>Comparison of applications vs. successful hires this year.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hiringData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 'bold' }}
                  itemStyle={{textTransform: 'capitalize'}}
                  cursor={{fill: "hsl(var(--accent))"}}
                />
                <Legend iconType="circle" iconSize={10} />
                <Bar dataKey="applied" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hired" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
            <CardDescription>Latest updates across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                        {item.avatar ? <AvatarImage src={item.avatar} data-ai-hint="person avatar" /> : null}
                        <AvatarFallback>{item.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.activity}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <PredictBurnoutCard />
    </div>
  )
}
