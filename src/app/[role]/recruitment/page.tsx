
"use client"

import React, { useState, useMemo } from "react";
import Link from 'next/link';
import { Bot, Search, Filter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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


const getStatusBadge = (status: Applicant['status']) => {
    switch (status) {
        case 'Interview':
            return <Badge variant="default">Interview</Badge>;
        case 'Offer':
            return <Badge className="bg-blue-500 text-white">Offer</Badge>;
        case 'Hired':
            return <Badge className="bg-green-500 text-white">Hired</Badge>;
        case 'Screening':
            return <Badge variant="secondary">Screening</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}


export default function RecruitmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const params = useParams();
  const router = useRouter();
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

  const filteredApplicants = useMemo(() => {
    return initialApplicants.filter(applicant =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            className="w-full pl-10" 
                            placeholder="Search by name or role..." 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Applied For</TableHead>
                                        <TableHead>Applied Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplicants.map((applicant) => (
                                        <TableRow key={applicant.id}>
                                            <TableCell className="font-medium">{applicant.name}</TableCell>
                                            <TableCell>{applicant.role}</TableCell>
                                            <TableCell>{applicant.appliedDate}</TableCell>
                                            <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => router.push(`/${role}/profile`)}>View Profile</Button>
                                            </TableCell>
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
