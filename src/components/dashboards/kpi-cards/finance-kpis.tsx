
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { kpiData } from "@/lib/mock-data/kpis";
import { DollarSign, FileCheck, Landmark, AlertTriangle } from "lucide-react";

export function FinanceKpis() {
    const data = kpiData.finance;
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Burn</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.monthlyBurn}K</div>
                    <p className="text-xs text-muted-foreground">Projected operational costs</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payroll Due</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.payrollDue}K</div>
                    <p className="text-xs text-muted-foreground">For this pay period</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.pendingApprovals}</div>
                    <p className="text-xs text-muted-foreground">Expense reports & invoices</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Flags</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.complianceFlags}</div>
                    <p className="text-xs text-muted-foreground">Potential audit risks</p>
                </CardContent>
            </Card>
        </div>
    )
}
