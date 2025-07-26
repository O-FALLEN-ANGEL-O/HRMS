
'use client';

import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTeam } from '@/hooks/use-team';
import { employeeCourseProgress, courses } from '@/lib/mock-data/learning';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TeamProgressTable = () => {
    const team = useTeam();
    const { toast } = useToast();
    const [selectedCourseId, setSelectedCourseId] = React.useState<string>(courses[0].id);

    const teamProgress = useMemo(() => {
        return team.map(member => {
            const progress = employeeCourseProgress.find(p => p.employeeId === member.employee_id && p.courseId === selectedCourseId);
            return {
                ...member,
                status: progress?.status || 'Not Started',
                progress: progress?.progress || 0,
            };
        });
    }, [team, selectedCourseId]);

    const handleSendReminder = (employeeName: string) => {
        toast({
            title: "Reminder Sent!",
            description: `A reminder notification has been sent to ${employeeName}.`
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
            case 'In Progress': return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
            default: return <Badge variant="secondary">Not Started</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Select a course to view progress" />
                    </SelectTrigger>
                    <SelectContent>
                        {courses.map(course => (
                             <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[200px]">Progress</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teamProgress.map(member => (
                        <TableRow key={member.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person avatar" />
                                        <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.role}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(member.status)}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Progress value={member.progress} className="h-2" />
                                    <span className="text-xs font-medium">{member.progress}%</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {member.status !== 'Completed' && (
                                    <Button variant="ghost" size="sm" onClick={() => handleSendReminder(member.name)}>
                                        <Send className="mr-2 h-4 w-4" /> Send Reminder
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
