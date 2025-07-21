
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Briefcase, Building, User, Clock, CheckCircle } from 'lucide-react';
import { initialEmployees } from '@/app/[role]/employees/page';

type Employee = typeof initialEmployees[0];

interface EmployeeDetailsCardProps {
    employee: Employee;
}

export function EmployeeDetailsCard({ employee }: EmployeeDetailsCardProps) {
  
  const manager = initialEmployees.find(emp => emp.role === 'Manager' && emp.department === employee.department);

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-4">
           <Avatar className="w-16 h-16">
              <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="person avatar" />
              <AvatarFallback>{employee.name.split(" ").map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='font-headline'>{employee.name} ({employee.id})</CardTitle>
              <CardDescription>{employee.role}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{employee.email}</span>
        </div>
        <div className="flex items-center gap-3">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{employee.department} Department</span>
        </div>
        {manager && (
            <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Reports to {manager.name}</span>
            </div>
        )}
         <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Shift: 9:00 AM - 6:00 PM</span>
        </div>
        <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
             <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className={employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-destructive/20 text-destructive-foreground'}>
                {employee.status}
            </Badge>
            <span>(Work from Office)</span>
        </div>
      </CardContent>
    </Card>
  );
}
