
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Calendar as CalendarIcon, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const ApplyLeaveDialog = dynamic(() => import('@/components/leaves/apply-leave-dialog'), {
    loading: () => <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Apply for Leave</Button>,
    ssr: false
});

const mockLeaveRequests = [
    { id: 'LR-001', employee: 'Anika Sharma', type: 'Sick Leave', dates: '15/07/24 - 16/07/24', days: 2, reason: 'Flu', status: 'Approved' },
    { id: 'LR-002', employee: 'Rohan Verma', type: 'Casual Leave', dates: '22/07/24 - 26/07/24', days: 5, reason: 'Family vacation', status: 'Approved' },
    { id: 'LR-003', employee: 'Priya Mehta', type: 'Work From Home', dates: '29/07/24 - 29/07/24', days: 1, reason: 'Plumber visit', status: 'Pending' },
];

const mockLeaveBalances = {
    sick: 7,
    casual: 12,
    pto: 20
};

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

function LeaveActionButtons({ requestId }: { requestId: string }) {
    const { toast } = useToast();
    const handleAction = (status: 'Approved' | 'Rejected') => {
        toast({ title: 'Action Triggered', description: `Request ${requestId} has been ${status}.` });
    };

    return (
        <div className='flex gap-2 justify-end'>
            <Button variant="outline" size="icon" className='border-green-500 text-green-500 hover:bg-green-100 hover:text-green-600' onClick={() => handleAction('Approved')}><Check className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className='border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600' onClick={() => handleAction('Rejected')}><X className="h-4 w-4" /></Button>
        </div>
    );
}


export default function LeaveManagementPage() {
    const params = useParams();
    const role = params.role as string;
    const isManager = role === 'manager' || role === 'hr' || role === 'admin';
    const pendingCount = mockLeaveRequests.filter(r => r.status === 'Pending').length;

    const applyForLeaveAction = async (formData: FormData) => {
        console.log("Mock Action: Applying for leave with data:", Object.fromEntries(formData));
        return { success: true };
    };

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
            <div className="text-2xl font-bold">{mockLeaveBalances.casual}</div>
            <p className="text-xs text-muted-foreground">out of 12 days remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Sick Leave</CardTitle>
             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLeaveBalances.sick}</div>
            <p className="text-xs text-muted-foreground">out of 7 days remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available PTO</CardTitle>
             <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLeaveBalances.pto}</div>
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
              {mockLeaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{isManager ? request.employee : request.id}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.dates}</TableCell>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
