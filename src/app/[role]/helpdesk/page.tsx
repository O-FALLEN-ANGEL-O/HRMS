
"use client"

import React, { useState } from 'react';
import { PlusCircle, MoreHorizontal, Bot, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { categorizeTicket } from '@/ai/flows/categorize-ticket';

const initialTickets = [
  {
    id: "TKT-001",
    subject: "Cannot access shared drive",
    category: "IT Support",
    priority: "High",
    status: "Open",
    lastUpdate: "2 hours ago",
  },
  {
    id: "TKT-002",
    name: "Question about maternity leave policy",
    category: "HR Query",
    priority: "Medium",
    status: "In Progress",
    lastUpdate: "1 day ago",
  },
  {
    id: "TKT-003",
    name: "Incorrect tax deduction in payslip",
    category: "Payroll Issue",
    priority: "High",
    status: "Open",
    lastUpdate: "3 hours ago",
  },
  {
    id: "TKT-004",
    name: "Office AC is not working",
    category: "Facilities",
    priority: "Low",
    status: "Closed",
    lastUpdate: "5 days ago",
  },
];

type Ticket = typeof initialTickets[0];

function NewTicketDialog({ onAddTicket }: { onAddTicket: (ticket: Ticket) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAiCategorize = async () => {
    if (!subject || !description) {
      toast({ title: "Missing Information", description: "Please enter a subject and description first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await categorizeTicket({ subject, description });
      setCategory(result.category);
      setPriority(result.priority);
      toast({ title: "AI Categorization Complete", description: `Category: ${result.category}, Priority: ${result.priority}` });
    } catch (e) {
      console.error(e);
      toast({ title: "Categorization Failed", description: "The AI could not categorize the ticket.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!subject || !description || !category || !priority) {
      toast({ title: "Missing Information", description: "Please fill all fields. Use the AI to help categorize.", variant: "destructive" });
      return;
    }
    const newTicket = {
      id: `TKT-${String(Date.now()).slice(-3)}`,
      subject,
      category,
      priority,
      status: "Open",
      lastUpdate: "Just now",
    };
    onAddTicket(newTicket);
    setIsOpen(false);
    // Reset form
    setSubject("");
    setDescription("");
    setCategory("");
    setPriority("");
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Ticket
      </Button>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Support Ticket</DialogTitle>
          <DialogDescription>Describe your issue below. Use the AI to automatically categorize it.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., My laptop is running slow" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please provide as much detail as possible..." />
          </div>
          <Button variant="outline" onClick={handleAiCategorize} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            {loading ? 'Analyzing...' : 'Categorize with AI'}
          </Button>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="AI will suggest a category" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
               <div className="flex items-center gap-2 h-10">
                 {priority ? getPriorityBadge(priority) : <p className="text-sm text-muted-foreground pl-3">AI will suggest a priority</p>}
               </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Submit Ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets as Ticket[]);

  const handleAddTicket = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">Open</Badge>;
      case 'In Progress':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">In Progress</Badge>;
      case 'Closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Helpdesk</h1>
          <p className="text-muted-foreground">Manage support tickets and employee inquiries.</p>
        </div>
        <NewTicketDialog onAddTicket={handleAddTicket} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Queue</CardTitle>
          <CardDescription>All support tickets are listed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Last Update</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono">{ticket.id}</TableCell>
                  <TableCell className="font-medium max-w-[250px] truncate">{ticket.subject || (ticket as any).name}</TableCell>
                  <TableCell className="hidden md:table-cell">{ticket.category}</TableCell>
                  <TableCell className="hidden md:table-cell">{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">{ticket.lastUpdate}</TableCell>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Assign</DropdownMenuItem>
                        <DropdownMenuItem>Close Ticket</DropdownMenuItem>
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
  );
}
