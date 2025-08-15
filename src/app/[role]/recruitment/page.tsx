
"use client"

import React, { useState, useMemo } from "react";
import Link from 'next/link';
import { Bot, Search, Filter, Link2, LayoutGrid, List } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { applicants as initialApplicants, type Applicant } from "@/lib/mock-data/applicants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getStatusBadge = (status: Applicant['status']) => {
    switch (status) {
        case 'Interview': return <Badge variant="default" className="bg-blue-100 text-blue-800">Interview</Badge>;
        case 'Offer': return <Badge className="bg-purple-100 text-purple-800">Offer</Badge>;
        case 'Hired': return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
        case 'Screening': return <Badge variant="secondary">Screening</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
}

function ApplicantTable({ applicants }: { applicants: Applicant[] }) {
    const params = useParams();
    const router = useRouter();
    const role = params.role || 'admin';
    return (
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
                            {applicants.map((applicant) => (
                                <TableRow key={applicant.id} className="cursor-pointer" onClick={() => router.push(`/${role}/recruitment/${applicant.id}`)}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={applicant.avatar} alt="Avatar" data-ai-hint="person avatar" />
                                                <AvatarFallback>{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            {applicant.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{applicant.role}</TableCell>
                                    <TableCell>{applicant.appliedDate}</TableCell>
                                    <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">View Profile</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

function ApplicantKanbanBoard({ applicants }: { applicants: Applicant[] }) {
    const params = useParams();
    const router = useRouter();
    const role = params.role || 'admin';
    const stages: Applicant['status'][] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

    const applicantsByStage = useMemo(() => {
        return stages.reduce((acc, stage) => {
            acc[stage] = applicants.filter(a => a.status === stage);
            return acc;
        }, {} as Record<Applicant['status'], Applicant[]>);
    }, [applicants]);

    return (
        <div className="flex gap-6 overflow-x-auto py-4">
            {stages.map(stage => (
                <div key={stage} className="w-72 flex-shrink-0">
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="font-semibold">{stage}</h3>
                         <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">{applicantsByStage[stage].length}</span>
                    </div>
                    <div className="space-y-3 bg-muted/50 p-2 rounded-lg h-full min-h-[300px]">
                        {applicantsByStage[stage].map(applicant => (
                            <Card key={applicant.id} className="cursor-pointer hover:bg-muted" onClick={() => router.push(`/${role}/recruitment/${applicant.id}`)}>
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={applicant.avatar} alt="Avatar" data-ai-hint="person avatar" />
                                            <AvatarFallback>{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{applicant.name}</p>
                                            <p className="text-xs text-muted-foreground">{applicant.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function RecruitmentPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
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

  const filteredApplicants = React.useMemo(() => {
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
        
        <Tabs defaultValue="kanban">
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
                    <TabsList>
                        <TabsTrigger value="kanban"><LayoutGrid className="mr-2 h-4 w-4"/> Board</TabsTrigger>
                        <TabsTrigger value="table"><List className="mr-2 h-4 w-4"/> Table</TabsTrigger>
                    </TabsList>
                    <Button variant="outline" onClick={() => toast({ title: 'Filter Clicked', description: 'This would normally open a filter dialog.' })}>
                        <Filter className="mr-2 h-4 w-4" />
                        <span>Filter</span>
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

            <TabsContent value="kanban">
                <ApplicantKanbanBoard applicants={filteredApplicants} />
            </TabsContent>
            <TabsContent value="table">
                <Card>
                    <CardHeader>
                        <CardTitle>All Applicants</CardTitle>
                        <CardDescription>A detailed list of all candidates in your hiring pipeline.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ApplicantTable applicants={filteredApplicants} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
