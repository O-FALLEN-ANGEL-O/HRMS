"use client"

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { detectPayrollErrors, DetectPayrollErrorsOutput } from '@/ai/flows/detect-payroll-errors';
import { Bot, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const examplePayrollData = {
  "employees": [
    { "id": 1, "name": "Alice", "salary": 5000, "bonus": 500, "hours_worked": 160 },
    { "id": 2, "name": "Bob", "salary": 12000, "bonus": 1000, "hours_worked": 160 },
    { "id": 3, "name": "Charlie", "salary": 5500, "bonus": 0, "hours_worked": 150 },
    { "id": 4, "name": "Diana", "salary": -100, "bonus": 200, "hours_worked": 160 }
  ]
};

export default function PayrollPage() {
  const [result, setResult] = useState<DetectPayrollErrorsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [payrollData, setPayrollData] = useState(JSON.stringify(examplePayrollData, null, 2));
  const { toast } = useToast();

  const handleDetectErrors = async () => {
    setLoading(true);
    setResult(null);
    try {
      JSON.parse(payrollData); // Validate JSON
    } catch (error) {
      toast({ title: "Invalid JSON", description: "The payroll data is not valid JSON.", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      const response = await detectPayrollErrors({ payrollData });
      setResult(response);
      toast({ title: "Analysis Complete", description: `Found ${response.errors.length} potential errors.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Analysis Failed", description: "There was an error analyzing the payroll data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
    }
  };


  return (
    <div>
      <div className="pb-4">
        <h1 className="text-3xl font-bold font-headline">Payroll</h1>
        <p className="text-muted-foreground">Process salaries and manage compensations.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Bot /> AI Payroll Error Detection
          </CardTitle>
          <CardDescription>
            Paste your payroll data (in JSON format) to detect discrepancies before processing.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Textarea
              placeholder="Paste payroll JSON here..."
              className="min-h-[400px] font-mono text-xs"
              value={payrollData}
              onChange={(e) => setPayrollData(e.target.value)}
            />
            <Button onClick={handleDetectErrors} disabled={loading} className="w-full">
              {loading ? 'Analyzing...' : 'Detect Errors with AI'}
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold">Analysis Result</h3>
            {loading && <div className="flex items-center justify-center h-full"><p>Analyzing payroll data...</p></div>}
            {result ? (
              <div className="space-y-4 flex-grow overflow-y-auto">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </CardContent>
                </Card>
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-md border p-3">
                      <AlertTriangle className="h-5 w-5 mt-1 text-destructive" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{error.field}</p>
                          {getSeverityBadge(error.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground">{error.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Results will be displayed here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
