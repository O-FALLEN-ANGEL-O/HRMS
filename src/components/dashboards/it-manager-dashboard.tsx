
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Laptop, HardDrive, Check, X, Wifi, AlertTriangle, CheckCircle, Server } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';

const deviceInventory = { total: 250, assigned: 210, available: 40 };

const initialRequests = [
    { id: 'REQ-001', type: 'Laptop', requestedBy: 'Anika Sharma', details: 'MacBook Pro 16"' },
    { id: 'REQ-002', type: 'Software', requestedBy: 'Rohan Verma', details: 'Figma License' },
    { id: 'REQ-003', type: 'Access', requestedBy: 'Priya Mehta', details: 'Admin access to production DB' },
];

const assignedAssets = [
    { deviceId: 'LT-015', type: 'Laptop', assignedTo: 'Anika Sharma', warrantyEnd: '2025-08-01' },
    { deviceId: 'LT-016', type: 'Laptop', assignedTo: 'Rohan Verma', warrantyEnd: '2025-08-01' },
    { deviceId: 'LT-017', type: 'Laptop', assignedTo: 'Priya Mehta', warrantyEnd: '2024-09-15' },
];

const systemDowntime = [
    { system: 'Email Server', time: '20 mins ago', duration: '15 mins', status: 'Resolved' },
    { system: 'Main App API', time: '2 days ago', duration: '45 mins', status: 'Resolved' },
]


export default function ItManagerDashboard() {
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  
  const handleApproval = (id: string, approved: boolean) => {
    const item = requests.find(r => r.id === id);
    setRequests(prev => prev.filter(r => r.id !== id));
    toast({
        title: `Request ${approved ? 'Approved' : 'Rejected'}`,
        description: `Request ${item?.id} from ${item?.requestedBy} has been processed.`,
    });
  };

  const handleQuickAction = (action: string) => {
      toast({
          title: `Action: ${action}`,
          description: `The "${action}" process has been initiated.`
      });
  }
  
  const getWarrantyStatus = (date: string) => {
    const warrantyDate = new Date(date);
    const today = new Date();
    const diffTime = warrantyDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return <Badge variant="destructive">Expired</Badge>;
    if (diffDays <= 30) return <Badge variant="secondary" className="bg-yellow-500 text-black">Expires Soon</Badge>;
    return <Badge variant="outline">Active</Badge>;
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                title="Device Inventory"
                value={`${deviceInventory.available} / ${deviceInventory.total}`}
                description={`${deviceInventory.assigned} devices assigned.`}
                icon={Laptop}
            />
             <DashboardCard 
                title="Pending Requests"
                value={requests.length}
                description="Equipment, software & access."
                icon={HardDrive}
            />
            <DashboardCard 
                title="Network Status"
                value="Online"
                description="99.99% Uptime this month."
                icon={Wifi}
            />
            <DashboardCard 
                title="Cybersecurity Threats"
                value="0"
                description="No active high-priority threats."
                icon={AlertTriangle}
            />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Live Request Tracker</CardTitle>
                        <CardDescription>Review and process all pending IT requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request Details</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <p className="font-medium">{item.details}</p>
                                            <p className="text-xs text-muted-foreground">{item.id} - {item.type} - by {item.requestedBy}</p>
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
                 <Card>
                     <CardHeader>
                        <CardTitle>Asset Management</CardTitle>
                        <CardDescription>Overview of assigned devices and their warranty status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Device ID</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Warranty</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {assignedAssets.map(item => (
                                    <TableRow key={item.deviceId}>
                                        <TableCell className="font-medium">{item.deviceId}</TableCell>
                                        <TableCell>{item.assignedTo}</TableCell>
                                        <TableCell>{getWarrantyStatus(item.warrantyEnd)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Status & Actions</CardTitle>
                        <CardDescription>Monitor core systems and perform quick actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-muted rounded-md space-y-2">
                             <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500"/>
                                <p className="font-semibold text-sm">All systems operational.</p>
                            </div>
                            <Progress value={99.99} className="h-2"/>
                            <p className="text-xs text-muted-foreground">Network Health: 99.99% Uptime</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <Button variant="outline" onClick={() => handleQuickAction('Schedule Maintenance')}>Schedule Maintenance</Button>
                           <Button variant="outline" onClick={() => handleQuickAction('Create Alert')}>Create Alert</Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>System Downtime Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {systemDowntime.map(item => (
                                <li key={item.system} className="flex items-start gap-3">
                                    <Server className="h-5 w-5 text-muted-foreground mt-0.5"/>
                                    <div>
                                        <p className="font-medium text-sm">{item.system} was down</p>
                                        <p className="text-xs text-muted-foreground">{item.time} for {item.duration}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
