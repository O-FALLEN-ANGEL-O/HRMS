
"use client"

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { autoGenerateWelcomeEmailAction } from './actions';
import type { AutoGenerateWelcomeEmailOutput } from '@/ai/flows/auto-generate-welcome-email';
import { Bot, Clipboard, Loader2, Send, File, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { onboardingCandidates, type OnboardingCandidate } from '@/lib/mock-data/onboarding';

function SendEmailDialog({ onSend, children }: { onSend: (candidate: OnboardingCandidate) => void; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedCandidate, setSelectedCandidate] = React.useState<OnboardingCandidate | null>(null);

    const handleSend = () => {
        if (selectedCandidate) {
            onSend(selectedCandidate);
            setIsOpen(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Select Candidate to Onboard</DialogTitle>
                    <DialogDescription>
                        Choose a candidate from the list to send the welcome email and offer letter to.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {onboardingCandidates.map(candidate => (
                                <TableRow 
                                    key={candidate.id} 
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className={`cursor-pointer ${selectedCandidate?.id === candidate.id ? 'bg-muted' : ''}`}
                                >
                                    <TableCell>
                                        <div className="font-medium">{candidate.name}</div>
                                        <div className="text-sm text-muted-foreground">{candidate.email}</div>
                                    </TableCell>
                                    <TableCell>{candidate.role}</TableCell>
                                    <TableCell><Badge variant="secondary">{candidate.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSend} disabled={!selectedCandidate}>
                        <Send className="mr-2 h-4 w-4" /> Send to Candidate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function OnboardingPage() {
  const [result, setResult] = React.useState<AutoGenerateWelcomeEmailOutput | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [attachment, setAttachment] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const input = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      jobTitle: formData.get('jobTitle') as string,
      department: formData.get('department') as string,
      startDate: formData.get('startDate') as string,
      teamMembers: formData.get('teamMembers') as string,
      companyName: "OptiTalent Inc.",
      companyCultureValues: "Innovation, collaboration, and customer-centricity.",
      hrContactName: "Alex Doe",
      hrContactEmail: "alex.doe@optitalent.com",
    };

    try {
      const response = await autoGenerateWelcomeEmailAction(input);
      setResult(response);
      toast({
        title: "Email Generated",
        description: "The welcome email has been successfully generated by AI.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the welcome email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      const emailContent = `Subject: ${result.subject}\n\n${result.body}`;
      navigator.clipboard.writeText(emailContent);
      toast({ title: "Copied!", description: "Email content copied to clipboard." });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleSendEmail = (candidate: OnboardingCandidate) => {
    if (result && candidate) {
      toast({
        title: "Email Sent!",
        description: `Welcome email ${attachment ? `with ${attachment.name}`: ''} has been sent to ${candidate.name} at ${candidate.email}.`
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4">
        <h1 className="text-3xl font-bold font-headline">Onboarding</h1>
        <p className="text-muted-foreground">Streamline the new hire experience.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Bot /> AI Welcome Email Generator
          </CardTitle>
          <CardDescription>
            Automatically generate a personalized welcome email for your new hires.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" defaultValue="Jane" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" defaultValue="Doe" required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue="Software Engineer" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" defaultValue="Technology" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="teamMembers">Team Members (comma-separated)</Label>
              <Input id="teamMembers" name="teamMembers" defaultValue="John Smith, Sarah Lee" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Generating...' : 'Generate Email'}
            </Button>
          </form>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4 h-full flex flex-col">
            <h3 className="text-lg font-semibold">Generated Email</h3>
            {loading && <div className="flex items-center justify-center h-full"><Loader2 className="mr-4 h-6 w-6 animate-spin" />Generating email content...</div>}
            {result ? (
              <div className="space-y-4 flex-grow flex flex-col">
                <Input readOnly value={result.subject} placeholder="Email Subject" />
                <Textarea readOnly value={result.body} placeholder="Email Body" className="flex-grow" rows={15} />

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <File className="mr-2 h-4 w-4"/>
                    Attach Offer Letter
                </Button>
                {attachment && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span>Attached: {attachment.name}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyToClipboard} className="w-full">
                    <Clipboard className="mr-2 h-4 w-4" /> Copy
                  </Button>
                  <SendEmailDialog onSend={handleSendEmail}>
                     <Button className="w-full">
                       <Send className="mr-2 h-4 w-4" /> Send Email
                     </Button>
                  </SendEmailDialog>
                </div>
              </div>
            ) : (
              !loading && <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Fill out the form to generate a welcome email.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
