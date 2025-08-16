

'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTicketSummaryAction } from "@/app/[role]/analytics/actions";
import type { TicketData } from "@/ai/flows/get-ticket-summary-flow.types";


export function ProcessManagerKpis() {
    const [stats, setStats] = useState<{ totalTickets: number; slaMet: number; highPriority: number; } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // This is a quick mock. In a real app, you might have separate API endpoints.
                const ticketData: TicketData = await getTicketSummaryAction();
                const totalTickets = ticketData.ticketSummary.reduce((sum, item) => sum + item.count, 0);
                // Mocking other stats
                const highPriority = Math.floor(totalTickets * 0.05);
                const slaMet = 98.5;

                setStats({ totalTickets, slaMet, highPriority });
            } catch (error) {
                console.error("Failed to fetch process manager KPIs", error);
                // Set fallback stats on error
                setStats({ totalTickets: 215, slaMet: 98.5, highPriority: 8 });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading || !stats) {
        return (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Open Tickets</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTickets}</div>
                    <p className="text-xs text-muted-foreground">Across all departments</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">4.2 hours</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">SLA Met</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.slaMet}%</div>
                    <p className="text-xs text-muted-foreground">Target: 98%</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Priority Tickets</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.highPriority}</div>
                    <p className="text-xs text-muted-foreground">Require immediate attention</p>
                </CardContent>
            </Card>
        </div>
    )
}
