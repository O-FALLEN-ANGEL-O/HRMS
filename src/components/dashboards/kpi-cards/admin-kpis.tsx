
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, TrendingUp, TrendingDown } from "lucide-react";

// Mock data is now hardcoded to remove dependency on the deleted kpis.ts file.
const data = {
    totalEmployees: 524,
    newHires: 18,
    attritionRate: 2.1
};

export function AdminKpis() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">+5 from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Hires</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{data.newHires}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Attrition Rate</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.attritionRate}%</div>
                    <p className="text-xs text-muted-foreground">-0.5% from last quarter</p>
                </CardContent>
            </Card>
        </div>
    )
}
