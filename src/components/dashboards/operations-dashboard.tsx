
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Factory, Gauge, AlertTriangle, User, Settings, ShieldAlert, Wrench } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const chartConfig = {
  utilization: { label: 'Utilization', color: 'hsl(var(--chart-1))' },
};

const resourceData = [
  { resource: 'CNC Machine A', utilization: 85 },
  { resource: 'Assembly Line 1', utilization: 92 },
  { resource: 'Packing Station', utilization: 78 },
  { resource: 'Welding Robot', utilization: 65 },
];

const productionLines = [
    { id: 1, name: 'Alpha Line', status: 'Running', product: 'Model-X Casing' },
    { id: 2, name: 'Beta Line', status: 'Running', product: 'Model-Y Assembly' },
    { id: 3, name: 'Gamma Line', status: 'Idle', product: 'N/A' },
    { id: 4, name: 'Delta Line', status: 'Maintenance', product: 'Model-X Casing' },
];

const workerStatus = [
    { id: 'W-001', name: 'Ravi Kumar', shift: 'Morning', status: 'On Duty' },
    { id: 'W-002', name: 'Sunita Singh', shift: 'Morning', status: 'On Break' },
    { id: 'W-003', name: 'Amit Patel', shift: 'Morning', status: 'On Duty' },
    { id: 'W-004', name: 'Rekha Sharma', shift: 'Night', status: 'Absent' },
]

export default function OperationsDashboard() {
  const { toast } = useToast();

  const handleActionClick = (action: string) => {
    toast({
        title: `Action Triggered`,
        description: `You have initiated the "${action}" process.`
    });
  }
  
  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Running': return 'text-green-500';
          case 'Idle': return 'text-yellow-500';
          case 'Maintenance': return 'text-red-500';
          default: return 'text-muted-foreground';
      }
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                title="Workers Present"
                value="182 / 200"
                description="91% attendance today."
                icon={Users}
            />
             <DashboardCard 
                title="Production Lines"
                value="3 / 4 Active"
                description="1 line under maintenance."
                icon={Factory}
            />
            <DashboardCard 
                title="OEE"
                value="85%"
                description="Overall Equipment Effectiveness."
                icon={Gauge}
            />
            <DashboardCard 
                title="Safety Incidents"
                value="0"
                description="No incidents reported in 24h."
                icon={AlertTriangle}
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Production Line Status</CardTitle>
                        <CardDescription>Real-time overview of all production lines.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Line</TableHead>
                                    <TableHead>Current Product</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productionLines.map(line => (
                                    <TableRow key={line.id}>
                                        <TableCell className="font-medium">{line.name}</TableCell>
                                        <TableCell>{line.product}</TableCell>
                                        <TableCell className={getStatusColor(line.status)}>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${getStatusColor(line.status).replace('text-','bg-')}`}></span>
                                                {line.status}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Resource Utilization</CardTitle>
                        <CardDescription>Current utilization of key equipment and resources.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={resourceData} layout="vertical" margin={{ right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                                <YAxis dataKey="resource" type="category" width={120} />
                                <ChartTooltip 
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                    content={<ChartTooltipContent />} 
                                />
                                <Bar dataKey="utilization" name="Utilization" fill="var(--color-utilization)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => handleActionClick('Adjust Shifts')}><Users className="mr-2 h-4 w-4"/>Adjust Shifts</Button>
                        <Button variant="outline" onClick={() => handleActionClick('Raise Maintenance Request')}><Wrench className="mr-2 h-4 w-4"/>Maintenance</Button>
                        <Button variant="outline" onClick={() => handleActionClick('Broadcast Alert')}><ShieldAlert className="mr-2 h-4 w-4"/>Broadcast</Button>
                        <Button variant="outline" onClick={() => handleActionClick('Schedule Audit')}><Settings className="mr-2 h-4 w-4"/>Schedule Audit</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Worker Status</CardTitle>
                        <CardDescription>Live attendance for morning shift.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Worker</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {workerStatus.map(worker => (
                                    <TableRow key={worker.id}>
                                        <TableCell className="font-medium">{worker.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={worker.status === 'On Duty' ? 'default' : 'secondary'}>{worker.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                             </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
