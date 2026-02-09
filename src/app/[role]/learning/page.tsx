
'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Bell, BookOpen, Check, Send, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { courses, employeeCourseProgress } from '@/lib/mock-data/learning';
import { CourseCard } from '@/components/learning/course-card';
import { TeamProgressTable } from '@/components/learning/team-progress-table';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTeam } from '@/hooks/use-team';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const EmployeeView = () => {
    const { user } = useAuth();
    const [myProgress, setMyProgress] = useState(employeeCourseProgress.filter(p => user && p.employeeId === user.profile.employee_id));

    useEffect(() => {
        if(user) {
            setMyProgress(employeeCourseProgress.filter(p => p.employeeId === user.profile.employee_id));
        }
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
    const team = useTeam();
    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const { toast } = useToast();

    const handleAssignCourse = () => {
        if (!selectedCourseId) {
            toast({ title: "Please select a course.", variant: 'destructive' });
            return;
        }
        if (selectedEmployees.length === 0) {
            toast({ title: "Please select employees.", variant: 'destructive' });
            return;
        }

        selectedEmployees.forEach(employeeId => {
            const isAssigned = employeeCourseProgress.some(p => p.employeeId === employeeId && p.courseId === selectedCourseId);
            if (!isAssigned) {
                employeeCourseProgress.push({
                    employeeId,
                    courseId: selectedCourseId,
                    status: 'Not Started',
                    progress: 0,
                });
            }
        });

        toast({
            title: "Course Assigned!",
            description: `The course has been assigned to ${selectedEmployees.length} employee(s).`
        });
        setSelectedEmployees([]);
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/> Assign Training</CardTitle>
                    <CardDescription>
                        Assign a new training course to selected members of your team.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold">1. Select Course</h4>
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course to assign" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         <h4 className="font-semibold pt-4">2. Assign to Employees</h4>
                         <div className="space-y-2">
                            {team.map(member => (
                                <div key={member.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                                    <Checkbox
                                        id={`emp-${member.id}`}
                                        checked={selectedEmployees.includes(member.employee_id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedEmployees(prev => 
                                                checked ? [...prev, member.employee_id] : prev.filter(id => id !== member.employee_id)
                                            );
                                        }}
                                    />
                                    <label htmlFor={`emp-${member.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {member.name}
                                    </label>
                                </div>
                            ))}
                         </div>
                    </div>
                     <div>
                        <Button className="w-full" onClick={handleAssignCourse} disabled={!selectedCourseId || selectedEmployees.length === 0}>
                            <Send className="mr-2 h-4 w-4" />
                            Assign Course to {selectedEmployees.length > 0 ? `${selectedEmployees.length} Employee(s)` : '...'}
                        </Button>
                     </div>
                </CardContent>
            </Card>

            <Separator />
            
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
        </div>
    );
};

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
                    {isManagerView ? "Assign courses and track your team's learning progress." : 'Access your assigned courses and training materials.'}
                </p>
            </div>
            {isManagerView ? <ManagerView /> : <EmployeeView />}
        </div>
    );
}
