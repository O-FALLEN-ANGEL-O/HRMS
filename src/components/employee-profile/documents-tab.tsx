
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookUser, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documents } from '@/lib/mock-data/documents';

export function DocumentsTab() {
     const { toast } = useToast();
     const handleDownload = (docName: string) => toast({title: `Downloading ${docName}`});

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookUser className="h-5 w-5 text-primary"/> My Documents</CardTitle>
                <CardDescription>View and download your important employment documents.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">{doc.name}</TableCell>
                                <TableCell><Badge variant="secondary">{doc.category}</Badge></TableCell>
                                <TableCell>{doc.date}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.name)}>
                                        <Download className="mr-2 h-4 w-4"/> Download
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
