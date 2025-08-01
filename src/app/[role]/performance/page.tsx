
"use client";

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generatePerformanceReviewAction } from './actions';
import type { GeneratePerformanceReviewOutput } from '@/ai/flows/generate-performance-review';
import { Bot, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PerformancePage() {
  const [result, setResult] = useState<GeneratePerformanceReviewOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const input = {
      employeeName: formData.get('employeeName') as string,
      jobTitle: formData.get('jobTitle') as string,
      goals: formData.get('goals') as string,
      achievements: formData.get('achievements') as string,
      areasForImprovement: formData.get('areasForImprovement') as string,
    };

    try {
      const response = await generatePerformanceReviewAction(input);
      setResult(response);
      toast({
        title: "Review Generated",
        description: "The performance review has been successfully generated by AI.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the performance review.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getRatingBadge = (rating?: 'Exceeds Expectations' | 'Meets Expectations' | 'Needs Improvement') => {
    switch (rating) {
      case 'Exceeds Expectations':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Exceeds Expectations</Badge>;
      case 'Meets Expectations':
        return <Badge variant="secondary">Meets Expectations</Badge>;
      case 'Needs Improvement':
        return <Badge variant="destructive">Needs Improvement</Badge>;
      default:
        return null;
    }
  };


  return (
    <div>
      <div className="pb-4">
        <h1 className="text-3xl font-bold font-headline">Performance</h1>
        <p className="text-muted-foreground">
          Track OKRs, manage reviews, and analyze skill gaps.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Bot /> AI Performance Review Generator
          </CardTitle>
          <CardDescription>
            Input employee details to generate a structured performance review summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
           <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input id="employeeName" name="employeeName" defaultValue="Alex Ray" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" name="jobTitle" defaultValue="Senior Designer" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="goals">Goals for Period</Label>
              <Textarea id="goals" name="goals" placeholder="e.g., Lead the redesign of the main dashboard..." required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="achievements">Key Achievements</Label>
              <Textarea id="achievements" name="achievements" placeholder="e.g., Successfully launched the new dashboard design on time..." required />
            </div>
             <div className="space-y-1">
              <Label htmlFor="areasForImprovement">Areas for Improvement</Label>
              <Textarea id="areasForImprovement" name="areasForImprovement" placeholder="e.g., Could improve documentation of design decisions..." required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Generating...' : 'Generate Review'}
            </Button>
          </form>

           <div className="rounded-lg border bg-muted/30 p-4 space-y-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold">Generated Review</h3>
            {loading && <div className="flex items-center justify-center h-full"><Loader2 className="mr-4 h-6 w-6 animate-spin" />Generating review...</div>}
            {result ? (
              <div className="space-y-4 flex-grow overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold">AI Suggested Rating:</h4>
                    {getRatingBadge(result.suggestedRating)}
                </div>
                <Textarea readOnly value={result.reviewSummary} placeholder="Review Summary" className="flex-grow" rows={15} />
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(result.reviewSummary)} className="w-full">
                  Copy Review
                </Button>
              </div>
            ) : (
              !loading && <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Fill out the form to generate a review.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
