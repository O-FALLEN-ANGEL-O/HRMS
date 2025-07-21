
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { leaveBalances, leaveRequests as initialLeaveRequests, type LeaveRequest } from '@/lib/mock-data/leaves';

function ApplyLeaveDialog({ onApply }: { onApply: (newRequest: LeaveRequest) => void }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const leaveType = formData.get('leave-type') as LeaveRequest['leaveType'];
      const fromDate = formData.get('from-date') as string;
      const toDate = formData.get('to-date') as string;
      const reason = formData.get('reason') as string;
  
      if (!leaveType || !fromDate || !toDate || !reason) {
        toast({ title: 'Missing fields', description: 'Please fill out all fields.', variant: 'destructive' });
        return;
      }
  
      const days = (new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 3600 * 24) + 1;
  
      const newRequest: LeaveRequest = {
        id: `LR-${String(Math.floor(Math.random() * 900) + 100)}`,
        employee: user?.profile?.name || 'Current User',
        leaveType,
        dates: `${fromDate} to ${toDate}`,
        days: days,
        status: 'Pending',
        reason,
      };
  
      onApply(newRequest);
      toast({ title: 'Request Submitted', description: 'Your leave request has been submitted for approval.' });
      setOpen(false);
    };

    return (
         <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Apply for Leave
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Apply for Leave</DialogTitle>
                    <DialogDescription>Fill out the form to request time off.</DialogDescription>
                </DialogHeader>
                 <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="leave-type">Leave Type</Label>
                            <Select name="leave-type" required>
                                <SelectTrigger id="leave-type">
                                    <SelectValue placeholder="Select a leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                    <SelectItem value="Paid Time Off">Paid Time Off (PTO)</SelectItem>
                                    <SelectItem value="Work From Home">Work From Home</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="from-date">From</Label>
                                <Input id="from-date" name="from-date" type="date" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to-date">To</Label>
                                <Input id="to-date" name="to-date" type="date" required />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea id="reason" name="reason" placeholder="Please provide a reason for your leave." required />
                        </div>
                     </div>
                    <DialogFooter>
                        <Button type="submit">Submit Request</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function LeaveManagementPage() {
    const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const role = params.role as string;

    const isManager = role === 'manager' || role === 'hr' || role === 'admin';


    const getStatusBadge = (status: string) => {
        switch (status) {
        case 'Approved':
            return <Badge variant="default" className='bg-green-500 hover:bg-green-600'>Approved</Badge>;
        case 'Pending':
            return <Badge variant="secondary">Pending</Badge>;
        case 'Rejected':
            return <Badge variant="destructive">Rejected</Badge>;
        default:
            return <Badge>{status}</Badge>;
        }
    };

    const handleAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
        setLeaveRequests(currentRequests =>
            currentRequests.map(req =>
                req.id === id ? { ...req, status: newStatus } : req
            )
        );
        toast({
            title: `Request ${newStatus}`,
            description: `Leave request ${id} has been successfully ${newStatus.toLowerCase()}.`
        });
    };
    
    const handleApplyLeave = (newRequest: LeaveRequest) => {
        setLeaveRequests(prev => [newRequest, ...prev]);
    }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
            <h1 className="text-3xl font-headline tracking-tight">Leave Management</h1>
            <p className="text-muted-foreground">Track and manage employee leave requests.</p>
        </div>
        <div className="flex gap-2">
            {isManager && (
                 <Button variant="outline" onClick={() => router.push(`/${role}/leaves/calendar`)}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Team Calendar
                </Button>
            )}
            <ApplyLeaveDialog onApply={handleApplyLeave} />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Casual Leave</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">out of 12 days remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Sick Leave</CardTitle>
             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">out of 7 days remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available PTO</CardTitle>
             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
             <p className="text-xs text-muted-foreground">out of 20 days remaining</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests.filter(r => r.status === 'Pending').length}</div>
             <p className="text-xs text-muted-foreground">waiting for approval</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>{isManager ? "All leave requests from your team." : "Your leave request history."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isManager ? 'Employee' : 'Request ID'}</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                {isManager && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{isManager ? request.employee : request.id}</TableCell>
                  <TableCell>{request.leaveType}</TableCell>
                  <TableCell>{request.dates}</TableCell>
                  <TableCell className="text-center">{request.days}</TableCell>
                  <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  {isManager && (
                    <TableCell className="text-right">
                      {request.status === 'Pending' ? (
                          <div className='flex gap-2 justify-end'>
                              <Button variant="outline" size="icon" className='border-green-500 text-green-500 hover:bg-green-100 hover:text-green-600' onClick={() => handleAction(request.id, 'Approved')}><Check className="h-4 w-4" /></Button>
                              <Button variant="outline" size="icon" className='border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600' onClick={() => handleAction(request.id, 'Rejected')}><X className="h-4 w-4" /></Button>
                          </div>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
