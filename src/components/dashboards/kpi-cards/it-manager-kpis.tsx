
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { kpiData } from "@/lib/mock-data/kpis";
import { Server, ShieldCheck, Ticket, Database } from "lucide-react";

export function ItManagerKpis() {
    const data = kpiData.itManager;
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.systemUptime}%</div>
                    <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.openTickets}</div>
                    <p className="text-xs text-muted-foreground">{data.highPriorityTickets} high priority</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.securityAlerts}</div>
                    <p className="text-xs text-muted-foreground">In the last 7 days</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Asset Inventory</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.assetCount}</div>
                    <p className="text-xs text-muted-foreground">Managed devices</p>
                </CardContent>
            </Card>
        </div>
    )
}
