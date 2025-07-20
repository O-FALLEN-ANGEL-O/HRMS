
"use client"

import React, { useState } from "react";
import Link from 'next/link';
import { PlusCircle, MoreVertical, Bot, Search, Filter } from "lucide-react";
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
  const role = params.role || 'admin';

  return (
     <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-gray-800">HR</h1>
            <h1 className="text-3xl font-bold text-primary">+</h1>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 font-headline">Recruitment Tools</h2>
        <p className="mt-2 text-lg text-gray-600">Streamline your hiring process with AI-powered tools.</p>
        
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 font-headline">Applicants</h3>
            <p className="mt-1 text-gray-600">Track and manage all candidates in your hiring pipeline.</p>
            
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input className="w-full pl-10" placeholder="Search by name..." type="text" />
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline">
                        <span>Filter by job...</span>
                        <Filter className="ml-2 h-4 w-4" />
                    </Button>
                    <Link href={`/${role}/recruitment/parse`}>
                        <Button>
                            <Bot className="mr-2 h-4 w-4" /> Parse Resume
                        </Button>
                    </Link>
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
        </div>
    </div>
  );
}
