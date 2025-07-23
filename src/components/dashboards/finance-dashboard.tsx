
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Banknote, FileSpreadsheet, ShieldCheck, Check, X, FileDown, Lock } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '../ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const chartConfig = {
  budget: { label: 'Budget', color: 'hsl(var(--chart-2))' },
  expenses: { label: 'Expenses', color: 'hsl(var(--chart-1))' },
};

const budgetData = [
  { department: 'Engineering', budget: 50000, expenses: 45000 },
  { department: 'Marketing', budget: 75000, expenses: 68000 },
  { department: 'Sales', budget: 60000, expenses: 55000 },
  { department: 'HR', budget: 25000, expenses: 22000 },
  { department: 'Operations', budget: 40000, expenses: 41000 },
];

const initialRequests = [
    { id: 'EXP-001', type: 'Expense Claim', submittedBy: 'Rohan Verma', amount: 250, details: 'Client Dinner' },
    { id: 'PO-001', type: 'Asset Purchase', submittedBy: 'IT Department', amount: 1200, details: 'New MacBook Pro' },
    { id: 'EXP-002', type: 'Expense Claim', submittedBy: 'Priya Mehta', amount: 80, details: 'Software Subscription' },
];

export default function FinanceDashboard() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  
  const handleApproval = (id: string, approved: boolean) => {
    const item = requests.find(r => r.id === id);
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({
        title: `Request ${approved ? 'Approved' : 'Rejected'}`,
        description: `Request ${item?.id} from ${item?.submittedBy} has been processed.`,
    });
  };

  const handleQuickAction = (action: string) => {
      toast({
          title: `Action: ${action}`,
          description: `The "${action}" process has been initiated.`
      });
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                title="Total Budget (YTD)"
                value="$5,250,000"
                description="Year-to-date allocated budget."
                icon={Banknote}
            />
             <DashboardCard 
                title="Expenses (YTD)"
                value="$4,875,000"
                description="92.8% of budget utilized."
                icon={FileSpreadsheet}
            />
            <DashboardCard 
                title="Pending Approvals"
                value={requests.length}
                description="Expense & purchase requests."
                icon={Banknote}
            />
            <DashboardCard 
                title="Compliance Status"
                value="99.2%"
                description="Adherence to financial regulations."
                icon={ShieldCheck}
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Department Budget vs. Expenses</CardTitle>
                        <CardDescription>Monthly overview of departmental spending.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <BarChart data={budgetData} layout="vertical" margin={{ right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                <XAxis type="number" tickFormatter={(value) => `$${(value as number)/1000}k`} />
                                <YAxis dataKey="department" type="category" width={80} />
                                <ChartTooltip 
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                    content={<ChartTooltipContent />} 
                                />
                                <Bar dataKey="budget" name="Budget" fill="var(--color-budget)" radius={4} />
                                <Bar dataKey="expenses" name="Expenses" fill="var(--color-expenses)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                     <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Initiate key financial processes.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" onClick={() => handleQuickAction('Process Payroll')}>
                            <Banknote className="mr-2 h-4 w-4"/> Process Payroll
                        </Button>
                        <Button variant="outline" onClick={() => handleQuickAction('Generate Financial Report')}>
                            <FileDown className="mr-2 h-4 w-4"/> Generate Report
                        </Button>
                        <Button variant="outline" onClick={() => handleQuickAction('Lock Salaries')}>
                            <Lock className="mr-2 h-4 w-4"/> Lock Salaries
                        </Button>
                        <Button variant="outline" onClick={() => handleQuickAction('Raise Purchase Order')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4"/> Raise PO
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                        <CardDescription>Review and process all pending financial requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <p className="font-medium">{item.details}</p>
                                            <p className="text-xs text-muted-foreground">{item.id} - ${item.amount} - by {item.submittedBy}</p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button size="icon" variant="outline" className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleApproval(item.id, true)}><Check className="h-4 w-4"/></Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => handleApproval(item.id, false)}><X className="h-4 w-4"/></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {requests.length === 0 && (
                            <caption className="py-4 text-sm text-muted-foreground">No pending requests.</caption>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
