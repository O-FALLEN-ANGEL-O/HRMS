
"use client"

import React, { useState } from "react";
import Link from 'next/link';
import { PlusCircle, MoreVertical, Bot, Search, Filter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { scoreResume } from "@/ai/flows/score-resume";
import { suggestInterviewQuestions } from "@/ai/flows/suggest-interview-questions";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";

type Applicant = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  appliedDate: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired';
};

const initialApplicants: Applicant[] = [
  { id: '1', name: 'Aarav Sharma', avatar: 'https://placehold.co/100x100?text=AS', role: 'Senior Frontend Developer', appliedDate: '2023-10-25', status: 'Interview' },
  { id: '2', name: 'Priya Patel', avatar: 'https://placehold.co/100x100?text=PP', role: 'Product Manager', appliedDate: '2023-10-24', status: 'Applied' },
  { id: '3', name: 'Rohan Gupta', avatar: 'https://placehold.co/100x100?text=RG', role: 'UI/UX Designer', appliedDate: '2023-10-23', status: 'Screening' },
  { id: '4', name: 'Sneha Verma', avatar: 'https://placehold.co/100x100?text=SV', role: 'Senior Frontend Developer', appliedDate: '2023-10-22', status: 'Offer' },
  { id: '5', name: 'Vikram Singh', avatar: 'https://placehold.co/100x100?text=VS', role: 'DevOps Engineer', appliedDate: '2023-10-21', status: 'Hired' },
];

export default function RecruitmentPage() {
  const [applicants] = useState<Applicant[]>(initialApplicants);
  const params = useParams();
  const { toast } = useToast();
  const role = params.role || 'admin';

  const handleCopyWalkinLink = () => {
    const walkinUrl = `${window.location.origin}/walkin-drive`;
    navigator.clipboard.writeText(walkinUrl);
    toast({
      title: "Link Copied!",
      description: "The walk-in registration link has been copied to your clipboard.",
    });
  };

  return (
     <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Recruitment</h1>
            <p className="text-muted-foreground">Manage your hiring pipeline and walk-in drives.</p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>All Applicants</CardTitle>
                <CardDescription>Track and manage all candidates in your hiring pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input className="w-full pl-10" placeholder="Search by name..." type="text" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            <span>Filter by job</span>
                        </Button>
                        <Link href={`/${role}/recruitment/parse`}>
                            <Button variant="outline">
                                <Bot className="mr-2 h-4 w-4" /> Parse Resume
                            </Button>
                        </Link>
                         <Button onClick={handleCopyWalkinLink}>
                            <Link2 className="mr-2 h-4 w-4" /> Copy Walk-in Link
                        </Button>
                    </div>
                </div>

                <div className="mt-4 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <Table className="min-w-full divide-y divide-gray-200">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</TableHead>
                                        <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Applied For</TableHead>
                                        <TableHead className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Applied Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-200 bg-white">
                                    {applicants.map((applicant) => (
                                        <TableRow key={applicant.id}>
                                            <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{applicant.name}</TableCell>
                                            <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{applicant.role}</TableCell>
                                            <TableCell className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{applicant.appliedDate}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
