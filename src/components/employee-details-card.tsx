
'use client';

import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Briefcase, Building, User, Clock, CheckCircle } from 'lucide-react';
import { mockEmployees } from '@/lib/mock-data/employees';

interface EmployeeDetailsCardProps {
    employee: any;
}

const EmployeeDetailsCardComponent = ({ employee }: EmployeeDetailsCardProps) => {
  
  const [manager, setManager] = useState<any>(null);

  useEffect(() => {
    const fetchManager = () => {
        if (!employee.department?.name) return;
        
        // Find a manager in the same department from mock data
        const managerInDept = mockEmployees.find(e => 
            e.role === 'manager' && e.department.name === employee.department.name
        );
        setManager(managerInDept);
    }
    fetchManager();
  }, [employee]);

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center gap-4">
           <Avatar className="w-16 h-16">
              <AvatarImage src={employee.profile_picture_url} alt={employee.full_name} data-ai-hint="person avatar" />
              <AvatarFallback>{employee.full_name.split(" ").map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className='font-headline'>{employee.full_name} ({employee.employee_id})</CardTitle>
              <CardDescription>{employee.job_title}</CardDescription>
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
            <span>{employee.department?.name || 'N/A'} Department</span>
        </div>
        {manager && (
            <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Reports to {manager.full_name}</span>
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

EmployeeDetailsCardComponent.displayName = 'EmployeeDetailsCard';
export const EmployeeDetailsCard = memo(EmployeeDetailsCardComponent);
