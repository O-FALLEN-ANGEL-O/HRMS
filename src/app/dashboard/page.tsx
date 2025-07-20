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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { predictBurnout } from "@/ai/flows/predict-burnout";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const recruitmentData = [
  { name: 'Applied', value: 120 },
  { name: 'Screening', value: 80 },
  { name: 'Interview', value: 45 },
  { name: 'Offer', value: 15 },
  { name: 'Hired', value: 10 },
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
          <div className="mt-4 space-y-4 rounded-lg border bg-accent/50 p-4">
            <h4 className="font-bold">Prediction Result:</h4>
            <p><strong>Risk Level:</strong> <Badge variant={result.burnoutRiskLevel === 'High' || result.burnoutRiskLevel === 'Critical' ? 'destructive' : 'default'}>{result.burnoutRiskLevel}</Badge></p>
            <div>
              <p><strong>Risk Factors:</strong></p>
              <ul className="list-disc pl-5">
                {result.riskFactors.map((factor: string, i: number) => <li key={i}>{factor}</li>)}
              </ul>
            </div>
            <div>
              <p><strong>Recommendations:</strong></p>
              <ul className="list-disc pl-5">
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
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applicants</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+235</div>
            <p className="text-xs text-muted-foreground">+12.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">Next cycle: July 30</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Recruitment Funnel</CardTitle>
            <CardDescription>Overview of the current hiring pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recruitmentData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
            <CardDescription>Your most common tasks, just a click away.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/dashboard/employees" className="w-full">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" /> Add New Employee
              </Button>
            </Link>
            <Link href="/dashboard/recruitment" className="w-full">
              <Button className="w-full justify-start" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
              </Button>
            </Link>
             <Link href="/dashboard/payroll" className="w-full">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Generate Payslips
              </Button>
            </Link>
             <Link href="/dashboard/performance" className="w-full">
              <Button className="w-full justify-start" variant="outline">
                <Activity className="mr-2 h-4 w-4" /> Start Performance Review
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <PredictBurnoutCard />
    </div>
  )
}
