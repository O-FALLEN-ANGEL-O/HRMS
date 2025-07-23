
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Handshake, Heart, CalendarClock, TrendingUp, PlusCircle, MessageSquarePlus } from "lucide-react";
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const clientData = [
  { id: 'cli-001', name: 'Innovate Corp', logo: 'https://logo.clearbit.com/innovate.com', csat: 95, health: 'Excellent', renewalDate: '2025-01-15' },
  { id: 'cli-002', name: 'Synergy Ltd', logo: 'https://logo.clearbit.com/synergy.com', csat: 88, health: 'Good', renewalDate: '2024-11-30' },
  { id: 'cli-003', name: 'Quantum Solutions', logo: 'https://logo.clearbit.com/quantum.com', csat: 72, health: 'At Risk', renewalDate: '2024-09-20' },
  { id: 'cli-004', name: 'Apex Industries', logo: 'https://logo.clearbit.com/apex.com', csat: 92, health: 'Good', renewalDate: '2025-03-01' },
];

export default function ClientServicesDashboard() {
  const { toast } = useToast();
  
  const handleAction = (action: string) => {
      toast({
          title: `Action: ${action}`,
          description: `The "${action}" process has been initiated.`
      });
  }

  const getHealthBadge = (health: 'Excellent' | 'Good' | 'At Risk') => {
      switch(health) {
          case 'Excellent': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Excellent</Badge>;
          case 'Good': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Good</Badge>;
          case 'At Risk': return <Badge variant="destructive">At Risk</Badge>;
          default: return <Badge variant="outline">{health}</Badge>;
      }
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
                title="Active Clients"
                value={clientData.length}
                description="Total number of managed accounts."
                icon={Handshake}
            />
             <DashboardCard 
                title="Avg. Client Satisfaction"
                value="89%"
                description="Based on recent CSAT surveys."
                icon={Heart}
            />
            <DashboardCard 
                title="Upcoming Renewals"
                value="2"
                description="Contracts renewing in the next 90 days."
                icon={CalendarClock}
            />
            <DashboardCard 
                title="Net Promoter Score (NPS)"
                value="+45"
                description="Overall client loyalty score."
                icon={TrendingUp}
            />
        </div>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Client Health Overview</CardTitle>
                    <CardDescription>Monitor the status and satisfaction of all your clients.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleAction('Add Client')}><PlusCircle className="mr-2 h-4 w-4"/> Add Client</Button>
                    <Button onClick={() => handleAction('Log Interaction')}><MessageSquarePlus className="mr-2 h-4 w-4"/> Log Interaction</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>CSAT Score</TableHead>
                            <TableHead>Health Status</TableHead>
                            <TableHead>Renewal Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clientData.map(client => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Image src={client.logo} alt={`${client.name} logo`} width={32} height={32} className="rounded-full bg-muted object-contain p-1" data-ai-hint="company logo"/>
                                        {client.name}
                                    </div>
                                </TableCell>
                                <TableCell>{client.csat}%</TableCell>
                                <TableCell>{getHealthBadge(client.health as any)}</TableCell>
                                <TableCell>{new Date(client.renewalDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
