
"use client"

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { suggestRoleAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { useTeam } from '@/hooks/use-team';
import { TeamCard } from '@/components/team-card';
import { mockEmployees } from '@/lib/mock-data/employees';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';


type Employee = (typeof mockEmployees)[0];

const AddEmployeeDialog = dynamic(() => Promise.resolve(({ onAddEmployee, children }: { onAddEmployee: (employee: Employee) => void; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [suggestedRole, setSuggestedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const departmentRef = React.useRef<HTMLInputElement>(null);
  const jobTitleRef = React.useRef<HTMLInputElement>(null);

  const handleSuggestRole = async () => {
    if (!departmentRef.current?.value || !jobTitleRef.current?.value) {
      toast({ title: "Missing Information", description: "Please enter department and job title.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await suggestRoleAction({
        department: departmentRef.current.value,
        jobTitle: jobTitleRef.current.value
      });
      setSuggestedRole(result.suggestedRole);
      toast({ title: "Role Suggested", description: `AI suggested the role: ${result.suggestedRole}` });
    } catch (e) {
      toast({ title: "Error", description: "Could not suggest a role.", variant: "destructive" });
    }
    setLoading(false);
  }

  const handleSave = () => {
    toast({ title: "Employee Added", description: `This is a mock action. In a real app, this would create a new user.` });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the details for the new employee. Use the AI assistant to suggest a role.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" ref={nameRef} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" ref={emailRef} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">Department</Label>
            <Input id="department" ref={departmentRef} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jobTitle" className="text-right">Job Title</Label>
            <Input id="jobTitle" ref={jobTitleRef} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input id="role" value={suggestedRole} onChange={(e) => setSuggestedRole(e.target.value)} />
              <Button variant="outline" size="icon" onClick={handleSuggestRole} disabled={loading}>
                <Bot className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Employee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}), {
    loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Add Employee</Button>,
    ssr: false
});


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const teamMembers = useTeam();
  const role = params.role as string;
  const isManagerView = role === 'manager' || role === 'team-leader' || role === 'trainer';

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
  }

  const handleDeactivate = (employeeId: string) => {
    setEmployees(prev => prev.map(emp => emp.id === employeeId ? {...emp, status: 'Inactive'} : emp));
    toast({ title: 'Success', description: 'Employee has been deactivated.' });
  };

  const AdminView = () => (
    <Card>
      <CardContent>
        {loading ? (
            <div className='text-center p-10'>Loading employees...</div>
        ) : (
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
              <TableRow key={employee.id}>
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
                <TableCell className="hidden md:table-cell">{employee.department.name || 'N/A'}</TableCell>
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
                      <DropdownMenuItem onClick={() => router.push(`/${role}/profile`)}>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeactivate(employee.id)}>Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );

  const ManagerView = () => (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
            <p>Loading team...</p>
        ) : teamMembers.map((member: any) => (
            <TeamCard key={member.id} member={member} />
        ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">{isManagerView ? "My Team" : "Employees"}</h1>
          <p className="text-muted-foreground">{isManagerView ? "Monitor your team's status and performance." : "Manage your organization's members."}</p>
        </div>
        {!isManagerView && (
             <Suspense fallback={<Button disabled>Loading...</Button>}>
                <AddEmployeeDialog onAddEmployee={handleAddEmployee}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                </AddEmployeeDialog>
             </Suspense>
        )}
      </div>
      {isManagerView ? <ManagerView /> : <AdminView />}
    </div>
  )
}
