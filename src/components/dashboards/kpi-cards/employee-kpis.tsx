
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Wallet } from "lucide-react";

// Mock data is now hardcoded to remove dependency on the deleted kpis.ts file.
const data = {
    tasksCompleted: 8,
    tasksTotal: 10,
    leaveBalance: 15,
    nextPayout: 4250.50,
    payoutDate: "July 31st"
};

export function EmployeeKpis() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.tasksCompleted}/{data.tasksTotal}</div>
                    <p className="text-xs text-muted-foreground">Completed this week</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.leaveBalance} Days</div>
                    <p className="text-xs text-muted-foreground">Remaining for the year</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.nextPayout.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">On {data.payoutDate}</p>
                </CardContent>
            </Card>
        </div>
    )
}
