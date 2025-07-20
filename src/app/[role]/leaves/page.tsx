
"use client";

import React, { useState } from 'react';
import { PlusCircle, MoreHorizontal } from "lucide-react";
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
import { leaveBalances, leaveRequests, LeaveRequest } from '@/lib/mock-data/leaves';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

function ApplyLeaveDialog({ onApply }: { onApply: (newRequest: LeaveRequest) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [date, setDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleApply = () => {
    if (!leaveType || !date || !reason) {
      toast({ title: "Missing Information", description: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    const newRequest: LeaveRequest = {
      id: `LR-${Math.floor(Math.random() * 1000)}`,
      leaveType,
      date: date.toISOString().split('T')[0],
      status: "Pending",
      reason,
    };
    onApply(newRequest);
    setIsOpen(false);
    setLeaveType("");
    setDate(undefined);
    setReason("");
    toast({ title: "Leave Request Submitted", description: "Your request has been sent for approval." });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Apply for Leave
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>Fill in the details to submit your leave request.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Leave Type</Label>
            <Select onValueChange={setLeaveType} value={leaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                <SelectItem value="Comp Off">Comp Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" placeholder="Please provide a reason for your leave" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleApply}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function EmployeeLeavesPage() {
    const [requests, setRequests] = useState(leaveRequests);
  
    const handleApply = (newRequest: LeaveRequest) => {
        setRequests(prev => [newRequest, ...prev]);
    }
  
    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'Approved':
          return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">Approved</Badge>;
        case 'Pending':
          return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">Pending</Badge>;
        case 'Rejected':
          return <Badge variant="destructive">Rejected</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>
      }
    };
  
    return (
        <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold font-headline">My Leaves</h1>
            <p className="text-muted-foreground">Manage your leave requests and balances.</p>
            </div>
            <ApplyLeaveDialog onApply={handleApply}/>
        </div>
  
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {leaveBalances.map(balance => (
            <Card key={balance.type}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{balance.type}</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{balance.balance}</div>
                <p className="text-xs text-muted-foreground">days remaining</p>
                </CardContent>
            </Card>
            ))}
        </div>
  
        <Card>
            <CardHeader>
            <CardTitle>Leave History</CardTitle>
            <CardDescription>A log of all your leave requests.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {requests.map((request) => (
                    <TableRow key={request.id}>
                    <TableCell className="font-mono">{request.id}</TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell className="max-w-[250px] truncate">{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={request.status !== 'Pending'}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Cancel Request</DropdownMenuItem>
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

function AdminLeavesPage() {
    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">Leave Management</h1>
                <p className="text-muted-foreground">Approve requests, manage policies, and view team calendars.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Admin Leave Dashboard</CardTitle>
                    <CardDescription>This area is for managing company-wide leave policies and requests.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">The admin dashboard for leave management is under construction.</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default function LeavesPage() {
    const { user } = useAuth();
    
    if (user?.role === 'employee') {
        return <EmployeeLeavesPage />;
    }
    
    // Default to Admin view
    return <AdminLeavesPage />;
}
