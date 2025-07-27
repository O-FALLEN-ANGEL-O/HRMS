
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Users, HeartPulse, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from '@/lib/mock-data/employees';
import { Input } from '../ui/input';

function InfoRow({ label, value, isEditing, onChange }: { label: string, value: React.ReactNode, isEditing?: boolean, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-dashed last:border-none">
            <span className="text-muted-foreground text-sm">{label}</span>
            {isEditing && onChange ? (
                <Input className="text-right h-7 p-1 max-w-[150px] text-sm" value={value as string} onChange={onChange}/>
            ) : (
                <span className="font-medium text-sm text-right">{value || 'N/A'}</span>
            )}
        </div>
    )
}

export function FamilyHealthTab({ employee, setEmployee, isEditing }: { employee: UserProfile & { familyAndHealthInfo?: any }, setEmployee: (e: any) => void, isEditing: boolean }) {
    const { toast } = useToast();
    
    const familyInfo = employee.familyAndHealthInfo || { dependents: [], health: {}, emergencyContact: {} };

    const handleAddItem = (section: 'dependents') => {
        const newEmployee = JSON.parse(JSON.stringify(employee));
        if (!newEmployee.familyAndHealthInfo) {
            newEmployee.familyAndHealthInfo = { dependents: [], health: {}, emergencyContact: {} };
        }
        if (section === 'dependents') {
            newEmployee.familyAndHealthInfo.dependents.unshift({ name: '', relationship: '', dob: '' });
        }
        setEmployee(newEmployee);
    };

    const handleRemoveItem = (section: 'dependents', index: number) => {
        const newEmployee = JSON.parse(JSON.stringify(employee));
        newEmployee.familyAndHealthInfo[section].splice(index, 1);
        setEmployee(newEmployee);
    };

    const handleFieldChange = (section: 'dependents' | 'health' | 'emergencyContact', value: string, index?: number, field?: string) => {
         const newEmployee = JSON.parse(JSON.stringify(employee));
         if(section === 'dependents' && index !== undefined && field) {
            newEmployee.familyAndHealthInfo.dependents[index][field] = value;
         } else if (field) {
            newEmployee.familyAndHealthInfo[section][field] = value;
         }
         setEmployee(newEmployee);
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Family & Dependents</CardTitle>
                    {isEditing && <Button variant="outline" size="sm" onClick={() => handleAddItem('dependents')}><Plus className="mr-2 h-4 w-4" /> Add</Button>}
                </CardHeader>
                <CardContent>
                   <Table>
                       <TableHeader>
                           <TableRow>
                               <TableHead>Name</TableHead>
                               <TableHead>Relationship</TableHead>
                               <TableHead>Date of Birth</TableHead>
                               {isEditing && <TableHead className="text-right">Actions</TableHead>}
                           </TableRow>
                       </TableHeader>
                       <TableBody>
                           {familyInfo.dependents.map((dep: any, i: number) => (
                               <TableRow key={i}>
                                   <TableCell className="font-medium">
                                       {isEditing ? <Input value={dep.name} onChange={(e) => handleFieldChange('dependents', e.target.value, i, 'name')} /> : dep.name}
                                   </TableCell>
                                   <TableCell>
                                       {isEditing ? <Input value={dep.relationship} onChange={(e) => handleFieldChange('dependents', e.target.value, i, 'relationship')} /> : dep.relationship}
                                   </TableCell>
                                   <TableCell>
                                       {isEditing ? <Input type="date" value={dep.dob} onChange={(e) => handleFieldChange('dependents', e.target.value, i, 'dob')} /> : dep.dob}
                                   </TableCell>
                                   {isEditing && <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleRemoveItem('dependents', i)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>}
                               </TableRow>
                           ))}
                       </TableBody>
                   </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary"/> Health & Emergency</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                   <div>
                        <h4 className="font-semibold mb-2">Health Information</h4>
                        <InfoRow label="Blood Group" value={familyInfo.health.bloodGroup} isEditing={isEditing} onChange={(e) => handleFieldChange('health', e.target.value, undefined, 'bloodGroup')} />
                        <InfoRow label="Allergies" value={familyInfo.health.allergies} isEditing={isEditing} onChange={(e) => handleFieldChange('health', e.target.value, undefined, 'allergies')} />
                   </div>
                   <div>
                        <h4 className="font-semibold mb-2">Emergency Contact</h4>
                        <InfoRow label="Contact Name" value={familyInfo.emergencyContact.name} isEditing={isEditing} onChange={(e) => handleFieldChange('emergencyContact', e.target.value, undefined, 'name')} />
                        <InfoRow label="Relationship" value={familyInfo.emergencyContact.relationship} isEditing={isEditing} onChange={(e) => handleFieldChange('emergencyContact', e.target.value, undefined, 'relationship')} />
                        <InfoRow label="Phone Number" value={familyInfo.emergencyContact.phone} isEditing={isEditing} onChange={(e) => handleFieldChange('emergencyContact', e.target.value, undefined, 'phone')} />
                   </div>
                </CardContent>
            </Card>
        </div>
    )
}
