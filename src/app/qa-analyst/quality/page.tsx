
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const completedEvaluations = [
    { id: 'EVAL-001', agent: 'Anika Sharma', interactionId: 'C-1230', score: 95, date: '2023-07-27', type: 'Chat' },
    { id: 'EVAL-002', agent: 'Rohan Verma', interactionId: 'V-5670', score: 88, date: '2023-07-27', type: 'Call' },
    { id: 'EVAL-003', agent: 'Priya Mehta', interactionId: 'C-1225', score: 92, date: '2023-07-26', type: 'Chat' },
];

const auditFormSections = [
    { id: 's1', title: 'Opening', questions: [{ id: 'q1', text: 'Was the standard greeting used?' }, { id: 'q2', text: 'Was the customer\'s name used?' }] },
    { id: 's2', title: 'Problem Identification', questions: [{ id: 'q3', text: 'Was the issue accurately identified?' }, { id: 'q4', text: 'Were clarifying questions asked?' }] },
    { id: 's3', title: 'Resolution', questions: [{ id: 'q5', text: 'Was the correct solution provided?' }, { id: 'q6', text: 'Was the resolution confirmed with the customer?' }] },
    { id: 's4', title: 'Closing', questions: [{ id: 'q7', text: 'Was the standard closing used?' }, { id: 'q8', text: 'Was further assistance offered?' }] },
];

function ViewAuditDialog({ evaluation, children }: { evaluation: typeof completedEvaluations[0], children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: 'Feedback Submitted', description: `Feedback for evaluation ${evaluation.id} has been saved.` });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Audit Details for {evaluation.interactionId}</DialogTitle>
                    <DialogDescription>Agent: {evaluation.agent} | Score: {evaluation.score}%</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {auditFormSections.map(section => (
                            <Card key={section.id}>
                                <CardHeader>
                                    <CardTitle className="text-base">{section.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {section.questions.map(q => (
                                        <div key={q.id} className="space-y-2">
                                            <Label>{q.text}</Label>
                                            <RadioGroup defaultValue="yes" className="flex gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                                                    <Label htmlFor={`${q.id}-yes`}>Yes</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id={`${q.id}-no`} />
                                                    <Label htmlFor={`${q.id}-no`}>No</Label>
                                                </div>
                                                 <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="na" id={`${q.id}-na`} />
                                                    <Label htmlFor={`${q.id}-na`}>N/A</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Overall Feedback</CardTitle></CardHeader>
                            <CardContent>
                                <Textarea placeholder="Provide overall feedback and coaching recommendations for the agent."/>
                            </CardContent>
                        </Card>
                         <DialogFooter className="sticky bottom-0 bg-background py-4">
                            <Button type="submit">Save Feedback</Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function QualityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Quality Management</h1>
                <p className="text-muted-foreground">Review completed evaluations and provide coaching feedback.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Completed Evaluations</CardTitle>
                    <CardDescription>A list of all quality audits you have completed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent</TableHead>
                                <TableHead>Interaction ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completedEvaluations.map((evaluation) => (
                                <TableRow key={evaluation.id}>
                                    <TableCell className="font-medium">{evaluation.agent}</TableCell>
                                    <TableCell>{evaluation.interactionId}</TableCell>
                                    <TableCell><Badge variant="outline">{evaluation.type}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={evaluation.score > 90 ? 'default' : 'secondary'} className={evaluation.score > 90 ? 'bg-green-100 text-green-800' : ''}>
                                            {evaluation.score}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{evaluation.date}</TableCell>
                                    <TableCell className="text-right">
                                        <ViewAuditDialog evaluation={evaluation}>
                                            <Button variant="outline" size="sm">View Audit</Button>
                                        </ViewAuditDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
