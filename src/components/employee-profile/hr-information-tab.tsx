
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Plus, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockPerformanceReviews = [
    { id: 'rev-001', date: '2024-06-15', rating: 'Exceeds Expectations', reviewer: 'Isabella Nguyen' },
    { id: 'rev-002', date: '2023-12-15', rating: 'Meets Expectations', reviewer: 'Isabella Nguyen' },
];

const mockDisciplinaryActions = [
    { id: 'act-001', date: '2024-03-20', type: 'Verbal Warning', reason: 'Repeated tardiness.', issuedBy: 'Isabella Nguyen' }
];

const mockSalaryInfo = {
    currentSalary: '₹ 1,200,000.00',
    payGrade: 'L5',
    lastRevision: '2024-04-01'
};

function InfoRow({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-dashed last:border-none">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="font-medium text-sm text-right">{value || 'N/A'}</span>
        </div>
    )
}

export function HRInformationTab() {
    const { toast } = useToast();
    const handleAction = (action: string) => toast({title: action, description: "This would open a relevant form or dialog."});

    const getRatingBadge = (rating: string) => {
        switch (rating) {
            case 'Exceeds Expectations': return <Badge className="bg-green-100 text-green-800">{rating}</Badge>;
            case 'Meets Expectations': return <Badge variant="secondary">{rating}</Badge>;
            case 'Needs Improvement': return <Badge variant="destructive">{rating}</Badge>;
            default: return <Badge variant="outline">{rating}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Performance Reviews</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleAction('Add Review')}><Plus className="mr-2 h-4 w-4" /> Add Review</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Reviewer</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPerformanceReviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>{review.date}</TableCell>
                                    <TableCell>{getRatingBadge(review.rating)}</TableCell>
                                    <TableCell>{review.reviewer}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleAction('View Review')}>View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary"/> Salary Details</CardTitle>
                         <Button variant="outline" size="sm" onClick={() => handleAction('Update Salary')}><Plus className="mr-2 h-4 w-4" /> Update</Button>
                    </CardHeader>
                    <CardContent>
                        <InfoRow label="Current Salary (Annum)" value={mockSalaryInfo.currentSalary} />
                        <InfoRow label="Pay Grade" value={mockSalaryInfo.payGrade} />
                        <InfoRow label="Last Revision Date" value={mockSalaryInfo.lastRevision} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary"/> Disciplinary Actions</CardTitle>
                         <Button variant="outline" size="sm" onClick={() => handleAction('Add Action')}><Plus className="mr-2 h-4 w-4" /> Add Action</Button>
                    </CardHeader>
                    <CardContent>
                        {mockDisciplinaryActions.length === 0 ? (
                             <p className="text-sm text-muted-foreground text-center py-4">No disciplinary actions recorded.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockDisciplinaryActions.map((action) => (
                                        <TableRow key={action.id}>
                                            <TableCell>{action.date}</TableCell>
                                            <TableCell><Badge variant="destructive">{action.type}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleAction('View Action')}>View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
