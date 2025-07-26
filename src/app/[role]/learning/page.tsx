
'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Bell, BookOpen, Check, Clock, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { courses, employeeCourseProgress } from '@/lib/mock-data/learning';
import { CourseCard } from '@/components/learning/course-card';
import { TeamProgressTable } from '@/components/learning/team-progress-table';


const EmployeeView = () => {
    const { user } = useAuth();

    const myProgress = useMemo(() => {
        if (!user) return [];
        return employeeCourseProgress.filter(p => p.employeeId === user.profile.employee_id);
    }, [user]);

    const myCourses = useMemo(() => {
        if (!myProgress.length) return [];
        const myCourseIds = myProgress.map(p => p.courseId);
        return courses.filter(c => myCourseIds.includes(c.id));
    }, [myProgress]);

    const overdueCourses = useMemo(() => {
        return myCourses.filter(course => {
            const progress = myProgress.find(p => p.courseId === course.id);
            if (!progress || progress.status === 'Completed') return false;
            
            const dueDate = new Date(course.dueDate);
            const today = new Date();
            return dueDate < today;
        });
    }, [myCourses, myProgress]);
    
    if (myCourses.length === 0) {
        return (
             <Card>
                <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Check className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">All Caught Up!</h3>
                <p className="text-muted-foreground text-sm max-w-md">You have no assigned courses at this time. Keep an eye on this page for new training opportunities.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {overdueCourses.length > 0 && (
                <Alert variant="destructive">
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Action Required!</AlertTitle>
                    <AlertDescription>
                        You have {overdueCourses.length} overdue course(s). Please complete them as soon as possible to remain compliant.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {myCourses.map(course => {
                    const progress = myProgress.find(p => p.courseId === course.id);
                    return (
                        <CourseCard 
                            key={course.id} 
                            course={course} 
                            progress={progress} 
                        />
                    );
                })}
            </div>
        </div>
    );
};


const ManagerView = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Team Training Progress</CardTitle>
                <CardDescription>
                    Monitor the training and compliance status for all members of your team.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TeamProgressTable />
            </CardContent>
        </Card>
    )
}

export default function LearningPage() {
    const params = useParams();
    const role = params.role as string;
    
    // Roles that will see the manager/team view
    const managerRoles = ['manager', 'hr', 'trainer', 'team-leader', 'admin'];
    const isManagerView = managerRoles.includes(role);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Learning & Development</h1>
                <p className="text-muted-foreground">
                    {isManagerView ? 'Track your team\'s learning progress.' : 'Access your assigned courses and training materials.'}
                </p>
            </div>
            {isManagerView ? <ManagerView /> : <EmployeeView />}
        </div>
    );
}
