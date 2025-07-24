
"use client"

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/hooks/use-toast';
import { mockEmployees } from '@/lib/mock-data/employees';
import { TeamCard } from '@/components/team-card';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

const AddEmployeeButton = dynamic(() => import('@/components/employees/add-employee-button'), {
    loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Add Employee</Button>,
    ssr: false
});


function AdminView() {
    const { toast } = useToast();
    
    const handleAction = (action: string) => {
        toast({
            title: "Action Triggered",
            description: `This is a mock action for "${action}".`,
        });
    };

    return (
        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>
              A list of all employees in the organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEmployees.map((employee) => (
                  <TableRow key={employee.employee_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={employee.profile_picture_url} alt="Avatar" data-ai-hint="person avatar" />
                          <AvatarFallback>{employee.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <p className="font-medium">{employee.full_name}</p>
                          <p className="text-sm text-muted-foreground hidden md:inline">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{employee.department.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className={employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-destructive/20 text-destructive-foreground'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleAction('View Profile')}>View Profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Edit')}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Deactivate')}>Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    );
}

function TeamView() {
    const teamMembers = mockEmployees.filter(e => e.department.name === 'Engineering' && e.role !== 'manager');
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member) => (
                <TeamCard key={member.employee_id} member={member} />
            ))}
        </div>
    );
}


export default function EmployeesPage() {
  const params = useParams();
  const role = params.role as string;
  const isTeamView = role === 'manager' || role === 'team-leader' || role === 'trainer';

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">{isTeamView ? "My Team" : "Employees"}</h1>
          <p className="text-muted-foreground">{isTeamView ? "Monitor your team's status and performance." : "Manage your organization's members."}</p>
        </div>
        {!isTeamView && (
            <Suspense fallback={<Button disabled>Loading...</Button>}>
                <AddEmployeeButton />
            </Suspense>
        )}
      </div>
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        {isTeamView ? <TeamView /> : <AdminView />}
      </Suspense>
    </div>
  )
}
