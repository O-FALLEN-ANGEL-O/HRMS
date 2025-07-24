
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Calendar as CalendarIcon, Check, X, Loader2 } from 'lucide-react';
import { getLeaveRequests, getLeaveBalances, handleLeaveAction, applyForLeaveAction } from './actions';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

const ApplyLeaveDialog = dynamic(() => import('@/components/leaves/apply-leave-dialog'), {
    loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Apply for Leave</Button>,
    ssr: false
});

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

async function LeaveActionButtons({ requestId }: { requestId: string }) {
    const takeAction = async (status: 'Approved' | 'Rejected') => {
        'use server';
        await handleLeaveAction(requestId, status);
        revalidatePath('/[role]/leaves', 'page');
    };

    return (
        <div className='flex gap-2 justify-end'>
            <form action={async () => takeAction('Approved')}>
                <Button variant="outline" size="icon" className='border-green-500 text-green-500 hover:bg-green-100 hover:text-green-600'><Check className="h-4 w-4" /></Button>
            </form>
            <form action={async () => takeAction('Rejected')}>
                 <Button variant="outline" size="icon" className='border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600'><X className="h-4 w-4" /></Button>
            </form>
        </div>
    );
}


export default async function LeaveManagementPage({ params }: { params: { role: string }}) {
    const role = params.role;
    const isManager = role === 'manager' || role === 'hr' || role === 'admin';

    // Fetch data in parallel
    const [leaveRequests, leaveBalances, pendingCount] = await Promise.all([
        getLeaveRequests(isManager ? undefined : 'user-012'), // Mock current user ID
        getLeaveBalances('user-012'), // Mock current user ID
        getLeaveRequests(isManager ? undefined : 'user-012', 'Pending').then(r => r.length),
    ]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
            <h1 className="text-3xl font-headline tracking-tight">Leave Management</h1>
            <p className="text-muted-foreground">Track and manage employee leave requests.</p>
        </div>
        <div className="flex gap-2">
            {isManager && (
                 <Button variant="outline" asChild>
                    <Link href={`/${role}/leaves/calendar`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Team Calendar
                    </Link>
                </Button>
            )}
             <Suspense fallback={<Button disabled>Loading...</Button>}>
                <ApplyLeaveDialog action={applyForLeaveAction} />
             </Suspense>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Casual Leave</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalances.casual}</div>
            <p className="text-xs text-muted-foreground">out of 12 days remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Sick Leave</CardTitle>
             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalances.sick}</div>
            <p className="text-xs text-muted-foreground">out of 7 days remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available PTO</CardTitle>
             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalances.pto}</div>
             <p className="text-xs text-muted-foreground">out of 20 days remaining</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
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
                  <TableCell className="font-medium">{isManager ? request.employees?.full_name : request.id}</TableCell>
                  <TableCell>{request.leave_type}</TableCell>
                  <TableCell>{new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">{request.days}</TableCell>
                  <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  {isManager && (
                    <TableCell className="text-right">
                      {request.status === 'Pending' ? (
                          <LeaveActionButtons requestId={request.id} />
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
                 {leaveRequests.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={isManager ? 7 : 6} className="text-center h-24">
                            No leave requests found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
