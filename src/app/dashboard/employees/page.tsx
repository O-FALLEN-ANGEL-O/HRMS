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
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { autoAssignRoles } from '@/ai/flows/auto-assign-roles';
import { useToast } from '@/hooks/use-toast';

const employees = [
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
    email: "jackson.lee@email.com",
    role: "HR",
    department: "Human Resources",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=JL",
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
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
    email: "sofia.davis@email.com",
    role: "Recruiter",
    department: "Human Resources",
    status: "Active",
    avatar: "https://placehold.co/100x100?text=SD",
  },
]

function AddEmployeeDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [suggestedRole, setSuggestedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const departmentRef = React.useRef<HTMLInputElement>(null);
  const jobTitleRef = React.useRef<HTMLInputElement>(null);

  const handleSuggestRole = async () => {
    if (!departmentRef.current?.value || !jobTitleRef.current?.value) {
      toast({ title: "Missing Information", description: "Please enter department and job title.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await autoAssignRoles({
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Employee
      </Button>
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
            <Input id="name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" type="email" className="col-span-3" />
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
          <Button type="submit">Save Employee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EmployeesPage() {
  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Employees</h1>
          <p className="text-muted-foreground">Manage your organization's members.</p>
        </div>
        <AddEmployeeDialog />
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
                    <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className={employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}>
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
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
