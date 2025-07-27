
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Users, HeartPulse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { familyAndHealthInfo } from '@/lib/mock-data/family-health-info';

function InfoRow({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-dashed last:border-none">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="font-medium text-sm text-right">{value || 'N/A'}</span>
        </div>
    )
}

export function FamilyHealthTab() {
    const { toast } = useToast();
    const handleAdd = (section: string) => toast({title: `Add ${section}`, description: "This would open a form dialog."});
    const handleEdit = (section: string) => toast({title: `Edit ${section}`, description: "This would open an edit dialog."});

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Family & Dependents</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleAdd('Dependent')}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </CardHeader>
                <CardContent>
                   <Table>
                       <TableHeader>
                           <TableRow>
                               <TableHead>Name</TableHead>
                               <TableHead>Relationship</TableHead>
                               <TableHead>Date of Birth</TableHead>
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {familyAndHealthInfo.dependents.map((dep, i) => (
                               <TableRow key={i}>
                                   <TableCell className="font-medium">{dep.name}</TableCell>
                                   <TableCell>{dep.relationship}</TableCell>
                                   <TableCell>{dep.dob}</TableCell>
                               </TableRow>
                           ))}
                       </TableBody>
                   </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary"/> Health & Emergency</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleEdit('Health Info')}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                   <div>
                        <h4 className="font-semibold mb-2">Health Information</h4>
                        <InfoRow label="Blood Group" value={familyAndHealthInfo.health.bloodGroup} />
                        <InfoRow label="Allergies" value={familyAndHealthInfo.health.allergies} />
                   </div>
                   <div>
                        <h4 className="font-semibold mb-2">Emergency Contact</h4>
                        <InfoRow label="Contact Name" value={familyAndHealthInfo.emergencyContact.name} />
                        <InfoRow label="Relationship" value={familyAndHealthInfo.emergencyContact.relationship} />
                        <InfoRow label="Phone Number" value={familyAndHealthInfo.emergencyContact.phone} />
                   </div>
                </CardContent>
            </Card>
        </div>
    )
}
