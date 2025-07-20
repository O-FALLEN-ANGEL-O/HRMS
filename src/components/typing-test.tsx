
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TypingTestProps {
  prompt: string;
  timeLimit: number; // in seconds
  onTestComplete: (results: { wpm: number; accuracy: number; }) => void;
}

export function TypingTest({ prompt, timeLimit, onTestComplete }: TypingTestProps) {
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [errors, setErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [chartData, setChartData] = useState<{name: string, wpm: number}[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const chartTimerRef = useRef<NodeJS.Timeout>();

  const promptChars = useMemo(() => prompt.split(''), [prompt]);

  const startTest = () => {
    setIsTestRunning(true);
    setTypedText('');
    setErrors(0);
    setTimeLeft(timeLimit);
    setWpm(0);
    setAccuracy(100);
    setChartData([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const endTest = useCallback(() => {
    setIsTestRunning(false);
    if(timerRef.current) clearInterval(timerRef.current);
    if(chartTimerRef.current) clearInterval(chartTimerRef.current);
    
    const wordsTyped = typedText.trim().split(/\s+/).length;
    const timeElapsedMinutes = (timeLimit - timeLeft) / 60;
    const finalWpm = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0;
    const finalAccuracy = typedText.length > 0 ? Math.max(0, Math.round(((typedText.length - errors) / typedText.length) * 100)) : 100;
    
    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    onTestComplete({ wpm: finalWpm, accuracy: finalAccuracy });
  }, [typedText, timeLeft, timeLimit, errors, onTestComplete]);


  useEffect(() => {
    if (isTestRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endTest();
    }
    return () => {
      if(timerRef.current) clearInterval(timerRef.current);
    }
  }, [isTestRunning, timeLeft, endTest]);
  
  useEffect(() => {
    if (isTestRunning) {
        chartTimerRef.current = setInterval(() => {
            const wordsTyped = typedText.trim().split(' ').filter(Boolean).length;
            const timeElapsedMinutes = (timeLimit - timeLeft) / 60;
            const currentWpm = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0;
            setWpm(currentWpm);
            setChartData(prev => [...prev, {name: `${timeLimit-timeLeft}s`, wpm: currentWpm}]);
        }, 2000);
    }
    return () => {
      if(chartTimerRef.current) clearInterval(chartTimerRef.current);
    }
  }, [isTestRunning, typedText, timeLeft, timeLimit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTestRunning) {
      startTest();
    }
    const newTypedText = e.target.value;
    setTypedText(newTypedText);

    let currentErrors = 0;
    newTypedText.split('').forEach((char, index) => {
      if (char !== prompt[index]) {
        currentErrors++;
      }
    });
    setErrors(currentErrors);
    
    const currentAccuracy = prompt.length > 0 ? Math.max(0, Math.round(((newTypedText.length - currentErrors) / newTypedText.length) * 100)) : 100;
    setAccuracy(currentAccuracy);
  };
  
  if (!isTestRunning && timeLeft === timeLimit) {
    return (
        <div className="text-center">
            <Button onClick={startTest}>Start Typing Test</Button>
            <p className="text-sm text-muted-foreground mt-2">Click the button to begin the {timeLimit / 60}-minute test.</p>
        </div>
    )
  }
  
  if(!isTestRunning && timeLeft === 0) {
     return <p className="text-center text-lg font-semibold">Test Completed. Submitting results...</p>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative text-lg font-mono p-4 bg-muted rounded-md h-32 overflow-hidden">
            <div className="whitespace-pre-wrap">
              {promptChars.map((char, index) => {
                let color = 'text-muted-foreground';
                if (index < typedText.length) {
                  color = char === typedText[index] ? 'text-primary' : 'text-destructive';
                }
                return <span key={index} className={color}>{char}</span>;
              })}
            </div>
             <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                {typedText.length} / {prompt.length}
            </div>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={typedText}
            onChange={handleInputChange}
            className="w-full h-0 p-0 m-0 border-0 outline-none"
            autoFocus
            onPaste={(e) => e.preventDefault()}
          />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Time Left</p>
            <p className="text-3xl font-bold font-headline">{Math.floor(timeLeft/60)}:{String(timeLeft % 60).padStart(2,'0')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Speed (WPM)</p>
            <p className="text-3xl font-bold font-headline">{wpm}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="text-3xl font-bold font-headline">{accuracy}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="h-[100px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}/>
                <Bar dataKey="wpm" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
