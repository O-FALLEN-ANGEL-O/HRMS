
"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { assessments } from '@/lib/mock-data/assessments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Video, Mic, ScreenShare, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TypingTest } from '@/components/typing-test';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription as AlertDesc, AlertTitle as AlertT } from '@/components/ui/alert';


type AssessmentState = 'consent' | 'inProgress' | 'finished';

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const assessmentId = params.id as string;

  const assessment = useMemo(() => assessments.find(a => a.id === assessmentId), [assessmentId]);

  const [assessmentState, setAssessmentState] = useState<AssessmentState>('consent');
  const [hasConsent, setHasConsent] = useState(false);
  const [permissions, setPermissions] = useState({ mic: false, webcam: false });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [typingResult, setTypingResult] = useState<{wpm: number, accuracy: number} | null>(null);
  
  const questions = useMemo(() => assessment?.sections.flatMap(s => s.questions) || [], [assessment]);
  const currentQuestion = questions[currentQuestionIndex];

  // Anti-cheating listeners
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      toast({
        variant: 'destructive',
        title: 'Tab Switch Detected!',
        description: 'You have been flagged for switching tabs. Continuing this behavior may lead to disqualification.',
      });
    }
  }, [toast]);
  
  useEffect(() => {
    if (assessmentState === 'inProgress') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    }
  }, [assessmentState, handleVisibilityChange]);


  useEffect(() => {
    if (!assessment) {
      router.push(`/${params.role}/assessments`);
    }
  }, [assessment, router, params.role]);

  const requestPermissions = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPermissions({ mic: true, webcam: true });
        toast({ title: "Permissions Granted", description: "Camera and microphone access enabled." });
        stream.getTracks().forEach(track => track.stop()); // Stop tracks immediately after getting permission
    } catch (err) {
        setPermissions({ mic: false, webcam: false });
        toast({ variant: 'destructive', title: "Permissions Denied", description: "You must allow camera and microphone access to proceed." });
    }
  };

  const startTest = () => {
    if (hasConsent && permissions.mic && permissions.webcam) {
        setAssessmentState('inProgress');
    } else {
        toast({
            variant: 'destructive',
            title: 'Cannot Start Test',
            description: 'Please provide consent and grant all required permissions.',
        });
    }
  };
  
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
    if(currentQuestion.type === 'typing' && typingResult) {
       setScore(typingResult.wpm); // For typing, score is WPM
       setAssessmentState('finished');
       toast({
         title: "Assessment Submitted!",
         description: `Your typing speed is ${typingResult.wpm} WPM with ${typingResult.accuracy}% accuracy.`,
       });
       return;
    }

    // Calculate score for MCQs
    let correctAnswers = 0;
    questions.forEach(q => {
      if (q.correct_answer === answers[q.id]) {
        correctAnswers++;
      }
    });
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setAssessmentState('finished');

    toast({
        title: "Assessment Submitted!",
        description: `You scored ${finalScore}%.`,
    })
  };

  if (!assessment) {
    return <div>Loading assessment...</div>;
  }
  
  if (assessmentState === 'consent') {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline text-center">Assessment Rules & Consent</CardTitle>
                    <CardDescription className="text-center">Please read the following rules and grant permissions before starting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="default" className="border-yellow-500/50 text-yellow-900 dark:text-yellow-200 [&>svg]:text-yellow-500">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertT>Proctoring Enabled</AlertT>
                        <AlertDesc>
                            This aptitude test will record your screen, microphone, and webcam during the session to ensure fairness. Please do not switch tabs or exit fullscreen mode. Any violation may lead to automatic disqualification.
                        </AlertDesc>
                    </Alert>
                    <div className="space-y-4">
                        <Button className="w-full" onClick={requestPermissions} disabled={permissions.mic && permissions.webcam}>
                            <Video className="mr-2 h-4 w-4" />
                            {permissions.mic && permissions.webcam ? 'Permissions Granted' : 'Grant Camera & Mic Access'}
                        </Button>
                        <div className="flex items-center space-x-2 p-4 border rounded-md">
                            <Checkbox id="terms" checked={hasConsent} onCheckedChange={(checked) => setHasConsent(checked as boolean)} />
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I consent to screen, mic, and webcam recording.
                            </label>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={startTest}
                        disabled={!hasConsent || !permissions.mic || !permissions.webcam}
                    >
                        Start Test
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }
  
  if (assessmentState === 'finished') {
    const passed = score >= assessment.passing_score;
    const isTypingTest = currentQuestion.type === 'typing';

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
                    {isTypingTest && typingResult ? (
                         <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-5xl font-bold font-headline text-primary">{typingResult.wpm}</p>
                                <p className="text-muted-foreground">WPM</p>
                            </div>
                            <div>
                                <p className="text-5xl font-bold font-headline text-primary">{typingResult.accuracy}%</p>
                                <p className="text-muted-foreground">Accuracy</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-5xl font-bold font-headline text-primary">{score}%</p>
                            <p className="text-muted-foreground">Your Score</p>
                        </div>
                    )}
                   
                    <p className="text-sm">
                        {passed 
                            ? "Your results have been recorded." 
                            : `The passing score is ${assessment.passing_score}${isTypingTest ? ' WPM' : '%'}. A reviewer may check your results.`}
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
          {questions.length > 1 && (
            <div className="pt-4">
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2 text-right">
                  Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          )}
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
            {currentQuestion?.type === 'typing' && currentQuestion.typing_prompt && assessment.sections[0] &&(
                 <TypingTest
                    prompt={currentQuestion.typing_prompt}
                    timeLimit={assessment.sections[0].time_limit * 60}
                    onTestComplete={(results) => {
                      setTypingResult(results);
                      handleSubmit();
                    }}
                  />
            )}
          </div>
        </CardContent>
        {currentQuestion?.type !== 'typing' && (
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
        )}
      </Card>
    </div>
  );
}
