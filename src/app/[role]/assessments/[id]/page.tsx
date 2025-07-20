"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { assessments } from '@/lib/mock-data/assessments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const assessmentId = params.id as string;

  const assessment = useMemo(() => assessments.find(a => a.id === assessmentId), [assessmentId]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  const questions = useMemo(() => assessment?.sections.flatMap(s => s.questions) || [], [assessment]);
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (!assessment) {
      router.push('/admin/assessments');
    }
  }, [assessment, router]);
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };
  
  const handleSubmit = () => {
     // Calculate score
    let correctAnswers = 0;
    questions.forEach(q => {
      if (q.correct_answer === answers[q.id]) {
        correctAnswers++;
      }
    });
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setIsFinished(true);

    toast({
        title: "Assessment Submitted!",
        description: `You scored ${finalScore}%.`,
    })
  };

  if (!assessment) {
    return <div>Loading assessment...</div>;
  }
  
  if (isFinished) {
    const passed = score >= assessment.passing_score;
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CardTitle className="flex justify-center">
                        {passed ? <CheckCircle className="h-12 w-12 text-green-500"/> : <AlertTriangle className="h-12 w-12 text-destructive"/>}
                    </CardTitle>
                    <CardTitle>{passed ? 'Congratulations!' : 'Review Needed'}</CardTitle>
                    <CardDescription>You have completed the assessment.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold font-headline">{score}%</p>
                    <p className="text-muted-foreground">Your score</p>
                    <p className="mt-4 text-sm">
                        {passed 
                            ? "You have successfully passed the assessment." 
                            : `The passing score is ${assessment.passing_score}%. A reviewer will check your results.`}
                    </p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={() => router.push(`/${params.role}/assessments`)}>
                        Back to Assessments
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <div>
                <CardTitle>{assessment.title}</CardTitle>
                <CardDescription>Process: {assessment.process_type}</CardDescription>
             </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4"/>
                <span>{assessment.duration} minutes</span>
             </div>
          </div>
          <div className="pt-4">
            <Progress value={(currentQuestionIndex / questions.length) * 100} />
            <p className="text-sm text-muted-foreground mt-2 text-right">
                Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg min-h-[200px]">
            <p className="font-semibold mb-4">{currentQuestion?.question_text}</p>
            {currentQuestion?.type === 'mcq' && (
              <RadioGroup value={answers[currentQuestion.id] || ''} onValueChange={handleAnswerChange}>
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`q${currentQuestion.id}-o${index}`} />
                    <Label htmlFor={`q${currentQuestion.id}-o${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>
          {currentQuestionIndex === questions.length - 1 ? (
             <AlertDialog>
                 <Button>Submit</Button>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You cannot change your answers after submitting. Please review your answers before proceeding.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction asChild>
                            <Button variant="outline">Cancel</Button>
                        </AlertDialogAction>
                        <AlertDialogAction onClick={handleSubmit}>
                            Submit Assessment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                 </AlertDialogContent>
             </AlertDialog>
          ) : (
            <Button onClick={handleNext}>
                Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
