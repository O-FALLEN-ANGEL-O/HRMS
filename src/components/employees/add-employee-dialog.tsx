
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addEmployeeAction, suggestRoleAction } from '@/app/[role]/employees/actions';

export default function AddEmployeeDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [suggestedRole, setSuggestedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();
  
  const formRef = React.useRef<HTMLFormElement>(null);
  const departmentRef = React.useRef<HTMLInputElement>(null);
  const jobTitleRef = React.useRef<HTMLInputElement>(null);

  const handleSuggestRole = async () => {
    if (!departmentRef.current?.value || !jobTitleRef.current?.value) {
      toast({ title: "Missing Information", description: "Please enter department and job title.", variant: "destructive" });
      return;
    }
    setAiLoading(true);
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
    setAiLoading(false);
  }
  
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if(!formRef.current) return;

    setLoading(true);
    const formData = new FormData(formRef.current);
    const result = await addEmployeeAction(formData);
    
    if(result.success) {
      toast({ title: "Employee Added", description: `The new employee has been added successfully.` });
      setIsOpen(false);
      formRef.current.reset();
      setSuggestedRole('');
    } else {
       toast({ title: "Failed to Add Employee", description: result.message, variant: "destructive" });
    }
    setLoading(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the details for the new employee. Use the AI assistant to suggest a role.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Department</Label>
                <Input id="department" name="department" ref={departmentRef} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="jobTitle" className="text-right">Job Title</Label>
                <Input id="jobTitle" name="jobTitle" ref={jobTitleRef} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <div className="col-span-3 flex items-center gap-2">
                <Input id="role" name="role" value={suggestedRole} onChange={(e) => setSuggestedRole(e.target.value)} required/>
                <Button variant="outline" size="icon" type="button" onClick={handleSuggestRole} disabled={aiLoading}>
                   {aiLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Bot className="h-4 w-4" />}
                </Button>
                </div>
            </div>
            </div>
             <DialogFooter>
                 <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Employee
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
