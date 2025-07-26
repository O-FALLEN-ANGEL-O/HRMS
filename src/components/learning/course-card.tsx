
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, PlayCircle } from "lucide-react";
import type { Course, EmployeeProgress } from "@/lib/mock-data/learning";
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CourseCardProps {
    course: Course;
    progress?: EmployeeProgress;
}

export const CourseCard = ({ course, progress }: CourseCardProps) => {
    
    const isOverdue = progress?.status !== 'Completed' && new Date(course.dueDate) < new Date();

    return (
        <Card className="flex flex-col">
            <CardHeader className="p-0">
                <div className="relative h-40 w-full">
                    <Image
                        src={course.imageUrl || 'https://placehold.co/600x400.png'}
                        alt={course.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                        data-ai-hint="course illustration"
                    />
                </div>
                <div className="p-6 pb-2">
                    <Badge variant="outline">{course.category}</Badge>
                    <CardTitle className="mt-2 font-headline">{course.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 px-6">
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                     <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration} hours</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span className={cn(isOverdue && "text-destructive font-semibold")}>
                           Due: {new Date(course.dueDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                {progress && (
                     <div>
                        <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                            <span>{progress.status}</span>
                            <span>{progress.progress}%</span>
                        </div>
                        <Progress value={progress.progress} className="h-2" />
                    </div>
                )}
            </CardContent>
            <CardFooter className="px-6 pb-6">
                <Button className="w-full">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {progress?.status === 'In Progress' ? 'Continue Course' : progress?.status === 'Completed' ? 'Review Course' : 'Start Course'}
                </Button>
            </CardFooter>
        </Card>
    );
};
