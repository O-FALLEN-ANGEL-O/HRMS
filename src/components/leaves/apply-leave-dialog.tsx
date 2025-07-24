
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function ApplyLeaveDialog({ action }: { action: (formData: FormData) => Promise<{success: boolean, message?: string}> }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      
      const result = await action(formData);

      if (result.success) {
        toast({ title: 'Request Submitted', description: 'Your leave request has been submitted for approval.' });
        setOpen(false);
      } else {
        toast({ title: 'Submission Failed', description: result.message, variant: 'destructive'});
      }
      setLoading(false);
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
                        <Button type="submit" disabled={loading}>
                           {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                           {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
