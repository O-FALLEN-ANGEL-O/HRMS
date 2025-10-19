
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, UserCheck, TrendingUp } from "lucide-react";

// Mock data is now hardcoded to remove dependency on the deleted kpis.ts file.
const data = {
    activeOpenings: 12,
    applicants: 234,
    timeToHire: 28,
    offersAccepted: 6
};

export function HrKpis() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Openings</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.activeOpenings}</div>
                    <p className="text-xs text-muted-foreground">Across all departments</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Applicants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.applicants}</div>
                    <p className="text-xs text-muted-foreground">In pipeline</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.timeToHire} Days</div>
                    <p className="text-xs text-muted-foreground">-2 days from last quarter</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Offers Accepted</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.offersAccepted}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
        </div>
    )
}
