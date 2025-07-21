
"use client"

import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { suggestRoleAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export const initialEmployees = [
  {
    id: "1",
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    role: "Admin",
    department: "Operations",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=OM",
  },
  {
    id: "2",
    name: "Jackson Lee",
    email: "hr@optitalent.com",
    role: "HR",
    department: "Human Resources",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=JL",
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    email: "manager@optitalent.com",
    role: "Manager",
    department: "Engineering",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=IN",
  },
  {
    id: "4",
    name: "William Kim",
    email: "will@email.com",
    role: "Employee",
    department: "Marketing",
    status: "On Leave",
    avatar: "https://placehold.co/100x100?text=WK",
  },
  {
    id: "5",
    name: "Sofia Davis",
    email: "recruiter@optitalent.com",
    role: "Recruiter",
    department: "Human Resources",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=SD",
  },
  {
    id: "6",
    name: "Anika Sharma",
    email: "anika.sharma@email.com",
    role: "Employee",
    department: "Engineering",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=AS",
  },
    {
    id: "7",
    name: "Rohan Verma",
    email: "rohan.verma@email.com",
    role: "Employee",
    department: "Engineering",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=RV",
  },
  {
    id: "8",
    name: "Priya Mehta",
    email: "priya.mehta@email.com",
    role: "Employee",
    department: "Engineering",
    status: "On Leave",
    avatar: "https://placehold.co/100x100?text=PM",
  },
  {
    id: "9",
    name: "Liam Smith",
    email: "team-leader@optitalent.com",
    role: "Team Leader",
    department: "Support",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=LS",
  },
  {
    id: "10",
    name: "Ava Wilson",
    email: "ava.wilson@email.com",
    role: "Employee",
    department: "Support",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=AW",
  },
  {
    id: "11",
    name: "Noah Brown",
    email: "noah.brown@email.com",
    role: "Employee",
    department: "Support",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=NB",
  },
  {
    id: "12",
    name: "Emma Jones",
    email: "finance.mgr@optitalent.com",
    role: "Manager",
    department: "Finance",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=EJ"
  },
  {
    id: "13",
    name: "Lucas Garcia",
    email: "lucas.g@email.com",
    role: "Employee",
    department: "Finance",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=LG"
  },
  {
    id: "14",
    name: "Mason Rodriguez",
    email: "it.mgr@optitalent.com",
    role: "Manager",
    department: "IT",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=MR"
  },
  {
    id: "15",
    name: "Ethan Martinez",
    email: "ethan.m@email.com",
    role: "Employee",
    department: "IT",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=EM"
  }
];

type Employee = typeof initialEmployees[0];

function AddEmployeeDialog({ onAddEmployee, children }: { onAddEmployee: (employee: Employee) => void; children: React.ReactNode }) {
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
    const name = nameRef.current?.value;
    const email = emailRef.current?.value;
    const department = departmentRef.current?.value;
    
    if (!name || !email || !department || !suggestedRole) {
      toast({ title: "Missing Information", description: "Please fill all fields and suggest a role.", variant: "destructive" });
      return;
    }
    
    const newEmployee: Employee = {
        id: (Math.random() * 1000).toString(),
        name,
        email,
        department,
        role: suggestedRole,
        status: "Active",
        avatar: `https://placehold.co/100x100?text=${name.split(' ').map(n => n[0]).join('')}`
    };
    onAddEmployee(newEmployee);
    setIsOpen(false);
    // Reset fields
    setSuggestedRole('');
    if(nameRef.current) nameRef.current.value = '';
    if(emailRef.current) emailRef.current.value = '';
    if(departmentRef.current) departmentRef.current.value = '';
    if(jobTitleRef.current) jobTitleRef.current.value = '';
    toast({ title: "Employee Added", description: `${name} has been added to the system.` });
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
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const router = useRouter();

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
  }

  const handleDeactivate = (employeeId: string) => {
    setEmployees(prev => prev.map(emp => emp.id === employeeId ? {...emp, status: 'Inactive'} : emp));
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Employees</h1>
          <p className="text-muted-foreground">Manage your organization's members.</p>
        </div>
        <AddEmployeeDialog onAddEmployee={handleAddEmployee}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Employee
            </Button>
        </AddEmployeeDialog>
      </div>
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
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={employee.avatar} alt="Avatar" data-ai-hint="person avatar" />
                        <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground hidden md:inline">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{employee.department}</TableCell>
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
                        <DropdownMenuItem onClick={() => router.push('/admin/profile')}>View Profile</DropdownMenuItem>
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
        </CardContent>
      </Card>
    </div>
  )
}
