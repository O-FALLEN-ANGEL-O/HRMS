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
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from '@/components/ui/alert-dialog';

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
      router.push(`/${params.role}/assessments`);
    }
  }, [assessment, router, params.role]);
  
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
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {passed ? <CheckCircle className="h-16 w-16 text-green-500"/> : <AlertTriangle className="h-16 w-16 text-destructive"/>}
                    </div>
                    <CardTitle className="text-3xl font-headline">{passed ? 'Congratulations!' : 'Review Needed'}</CardTitle>
                    <CardDescription>{passed ? "You have successfully passed the assessment." : "You have completed the assessment."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-5xl font-bold font-headline text-primary">{score}%</p>
                        <p className="text-muted-foreground">Your Score</p>
                    </div>
                    <p className="text-sm">
                        {passed 
                            ? "Your results have been recorded." 
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
          <div className="flex justify-between items-start">
             <div>
                <CardTitle>{assessment.title}</CardTitle>
                <CardDescription>{assessment.process_type}</CardDescription>
             </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4"/>
                <span>{assessment.duration} minutes</span>
             </div>
          </div>
          <div className="pt-4">
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-right">
                Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg min-h-[250px] flex flex-col justify-center">
            <p className="font-semibold text-lg mb-6 text-center">{currentQuestion?.question_text}</p>
            {currentQuestion?.type === 'mcq' && (
              <RadioGroup value={answers[currentQuestion.id] || ''} onValueChange={handleAnswerChange} className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-accent has-[:checked]:border-primary">
                    <RadioGroupItem value={option} id={`q${currentQuestion.id}-o${index}`} />
                    <Label htmlFor={`q${currentQuestion.id}-o${index}`} className="flex-1 cursor-pointer">{option}</Label>
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
                 <AlertDialogTrigger asChild>
                    <Button disabled={!answers[currentQuestion.id]}>Submit</Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You cannot change your answers after submitting. Please review your answers before proceeding.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>
                            Submit Assessment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                 </AlertDialogContent>
             </AlertDialog>
          ) : (
            <Button onClick={handleNext} disabled={!answers[currentQuestion.id]}>
                Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
