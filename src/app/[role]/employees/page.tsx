
import React, { Suspense } from 'react';
import { PlusCircle, MoreHorizontal, Bot } from "lucide-react"
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getEmployees, deactivateEmployeeAction } from './actions';
import { TeamCard } from '@/components/team-card';
import { Loader2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import AddEmployeeButton from '@/components/employees/add-employee-button';
import { useAuth } from '@/hooks/use-auth';

type Employee = Awaited<ReturnType<typeof getEmployees>>[0];

function DeactivateMenuItem({ employeeId, employeeName }: { employeeId: string, employeeName: string }) {
    
    const handleDeactivate = async () => {
        'use server';
        // In a real app, you might want a confirmation dialog here.
        await deactivateEmployeeAction(employeeId);
        revalidatePath('/[role]/employees', 'page');
        // Toast can be shown via a client component if needed.
    };
    return <DropdownMenuItem className="text-destructive" onClick={handleDeactivate}>Deactivate</DropdownMenuItem>;
}


async function AdminView({ role }: { role: string }) {
    const employees = await getEmployees();

    if (!employees || employees.length === 0) {
        return (
             <Card>
                <CardContent className="p-10 text-center">
                    <p className="text-muted-foreground">No employees found in the database. Try seeding the data.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
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
                {employees.map((employee) => (
                    employee && (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={employee.profile_picture_url || undefined} alt="Avatar" data-ai-hint="person avatar" />
                          <AvatarFallback>{employee.full_name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <p className="font-medium">{employee.full_name}</p>
                          <p className="text-sm text-muted-foreground hidden md:inline">{employee.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{employee.department?.name || 'N/A'}</TableCell>
                    <TableCell>{employee.user?.role}</TableCell>
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
                          <DropdownMenuItem asChild>
                            <a href={`/${role}/profile?userId=${employee.user_id}`}>View Profile</a>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DeactivateMenuItem employeeId={employee.id} employeeName={employee.full_name}/>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  )
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    );
}

function TeamView({ members }: { members: Employee[] }) {
    if (members.length === 0) {
       return (
             <Card>
                <CardContent className="p-10 text-center">
                    <p className="text-muted-foreground">No team members found for your department.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member: any) => (
                <TeamCard key={member.id} member={member} />
            ))}
        </div>
    );
}


export default async function EmployeesPage({ params }: { params: { role: string } }) {
  const role = params.role;
  const isTeamView = role === 'manager' || role === 'team-leader' || role === 'trainer';
  
  const employees = await getEmployees();
  
  // In a real app, you'd fetch only the relevant team members based on the logged-in user.
  // We filter on the client for simplicity.
  const teamMembers = isTeamView ? employees.filter(e => e.department?.name === 'Engineering' && e.user?.role !== 'manager') : [];

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">{isTeamView ? "My Team" : "Employees"}</h1>
          <p className="text-muted-foreground">{isTeamView ? "Monitor your team's status and performance." : "Manage your organization's members."}</p>
        </div>
        {!isTeamView && (
            <AddEmployeeButton />
        )}
      </div>
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
        {isTeamView ? <TeamView members={teamMembers} /> : <AdminView role={role} />}
      </Suspense>
    </div>
  )
}
