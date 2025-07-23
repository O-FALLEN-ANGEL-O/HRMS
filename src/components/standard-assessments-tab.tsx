
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { assessments } from "@/lib/mock-data/assessments";
import { standardApplicantAssessments, type ApplicantWithAssessments } from '@/lib/mock-data/standard-assessments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Check, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

export const StandardAssessmentsTab = ({ applicantId }: { applicantId: string }) => {
    const { toast } = useToast();
    const [applicantData, setApplicantData] = useState<ApplicantWithAssessments | undefined>(undefined);
    const [selectedScores, setSelectedScores] = useState<Record<string, number>>({});
    
    useEffect(() => {
        // Find the applicant's assessment data from our mock db
        let data = standardApplicantAssessments.find(a => a.applicantId === applicantId);
        // If they don't exist, create a new entry for them
        if (!data) {
            data = { applicantId, assessments: [] };
            standardApplicantAssessments.push(data);
        }
        setApplicantData(data);
    }, [applicantId]);

    if (!applicantData) {
        return <Card><CardContent><p className="p-4 text-muted-foreground">Loading assessment data...</p></CardContent></Card>;
    }

    const handleAssignTest = (assessmentId: string) => {
        if (!assessmentId || !applicantData) return;

        const alreadyAssigned = applicantData.assessments.some(a => a.assessmentId === assessmentId);
        if (alreadyAssigned) {
            toast({ title: 'Already Assigned', description: 'This assessment is already assigned to the applicant.', variant: 'destructive' });
            return;
        }

        const newAssessment = {
            assessmentId,
            status: 'Not Started' as const,
            attempts: [],
        };
        
        const updatedApplicantData = { ...applicantData, assessments: [...applicantData.assessments, newAssessment] };
        
        // In a real app, this would be an API call. For mock, find and update array.
        const index = standardApplicantAssessments.findIndex(a => a.applicantId === applicantId);
        if (index > -1) {
            standardApplicantAssessments[index] = updatedApplicantData;
        }
        setApplicantData(updatedApplicantData);
        toast({ title: 'Assessment Assigned', description: 'The new assessment has been assigned to the applicant.' });
    };

    const handleApproval = (assessmentId: string, approve: boolean) => {
        if (!applicantData) return;
        const updatedAssessments = applicantData.assessments.map(appAssessment => {
            if (appAssessment.assessmentId === assessmentId && appAssessment.retryRequest?.status === 'Pending') {
                return {
                    ...appAssessment,
                    status: approve ? 'Retry Approved' as const : 'Completed' as const,
                    retryRequest: {
                        ...appAssessment.retryRequest,
                        status: approve ? 'Approved' as const : 'Denied' as const,
                    }
                };
            }
            return appAssessment;
        });

        const updatedApplicantData = { ...applicantData, assessments: updatedAssessments };
        setApplicantData(updatedApplicantData);
        const index = standardApplicantAssessments.findIndex(a => a.applicantId === applicantId);
        if (index > -1) {
            standardApplicantAssessments[index] = updatedApplicantData;
        }

        toast({
            title: `Request ${approve ? 'Approved' : 'Denied'}`,
            description: `The retry request has been ${approve ? 'approved' : 'denied'}.`,
        });
    }

    const handleScoreSelect = (assessmentId: string, attemptNumber: number) => {
        setSelectedScores(prev => ({...prev, [assessmentId]: attemptNumber}));
        toast({ title: `Score for attempt #${attemptNumber} has been marked as final.`});
    };

    const availableAssessments = assessments.filter(
        (a) => !applicantData.assessments.some(aa => aa.assessmentId === a.id)
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assessments & Retries</CardTitle>
                <CardDescription>Assign tests, review scores, and manage retry requests for this applicant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Assign New Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={handleAssignTest}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a test to assign..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableAssessments.map(a => (
                                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {applicantData.assessments.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-4">No assessments assigned to this applicant yet.</p>
                )}

                {applicantData.assessments.map(appAssessment => {
                    const assessmentDetails = assessments.find(a => a.id === appAssessment.assessmentId);
                    if (!assessmentDetails) return null;

                    const retryRequest = appAssessment.retryRequest;

                    return (
                        <Card key={appAssessment.assessmentId} className="p-4">
                            <h4 className="font-semibold">{assessmentDetails.title}</h4>
                            
                            {retryRequest && retryRequest.status === 'Pending' && (
                                <Alert className="my-4 border-amber-500/50">
                                    <AlertTitle className="text-amber-600 dark:text-amber-400">Pending Retry Request</AlertTitle>
                                    <AlertDescription>
                                        <p className="text-sm italic">"{retryRequest.reason}"</p>
                                        <div className="flex gap-2 justify-end mt-2">
                                            <Button size="sm" onClick={() => handleApproval(appAssessment.assessmentId, true)}><Check className="mr-2 h-4 w-4"/>Approve</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleApproval(appAssessment.assessmentId, false)}><X className="mr-2 h-4 w-4"/>Deny</Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="mt-2 text-sm text-muted-foreground">Score History:</div>
                            {appAssessment.attempts.length > 0 ? (
                                <RadioGroup value={selectedScores[appAssessment.assessmentId]?.toString()} onValueChange={(val) => handleScoreSelect(appAssessment.assessmentId, parseInt(val))}>
                                <ul className="mt-1 space-y-1">
                                {appAssessment.attempts.map((attempt, i) => (
                                    <li key={i} className="flex justify-between items-center text-sm p-2 bg-muted rounded has-[:checked]:bg-primary/20">
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value={attempt.attemptNumber.toString()} id={`std-score-${attempt.attemptNumber}`} />
                                            <Label htmlFor={`std-score-${attempt.attemptNumber}`} className="cursor-pointer">Attempt {attempt.attemptNumber}</Label>
                                        </div>
                                        <span className="font-semibold">{attempt.score ?? 'N/A'}{assessmentDetails.passing_score_type === 'percent' ? '%' : ' WPM'}</span>
                                    </li>
                                ))}
                                </ul>
                                </RadioGroup>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center p-2">No attempts yet.</p>
                            )}
                        </Card>
                    )
                })}
            </CardContent>
        </Card>
    );
};
