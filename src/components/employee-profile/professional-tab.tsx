
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, History, Award, Briefcase, Star, Trash2 } from "lucide-react";
import type { UserProfile } from '@/lib/mock-data/employees';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export function ProfessionalTab({ employee, setEmployee, isEditing }: { employee: UserProfile & { professionalInfo?: any }, setEmployee: (e: any) => void, isEditing: boolean }) {
    
    const professionalInfo = employee.professionalInfo || { experience: [], education: [], skills: [], certifications: [] };

    const handleAddItem = (section: 'experience' | 'education') => {
        const newEmployee = JSON.parse(JSON.stringify(employee));
        if (!newEmployee.professionalInfo) {
            newEmployee.professionalInfo = { experience: [], education: [], skills: [], certifications: [] };
        }

        if (section === 'experience') {
            newEmployee.professionalInfo.experience.unshift({ role: '', company: '', dates: '' });
        } else if (section === 'education') {
            newEmployee.professionalInfo.education.unshift({ degree: '', institution: '', year: '' });
        }
        setEmployee(newEmployee);
    };

    const handleRemoveItem = (section: 'experience' | 'education', index: number) => {
        const newEmployee = JSON.parse(JSON.stringify(employee));
        newEmployee.professionalInfo[section].splice(index, 1);
        setEmployee(newEmployee);
    };

    const handleFieldChange = (section: 'experience' | 'education', index: number, field: string, value: string) => {
        const newEmployee = JSON.parse(JSON.stringify(employee));
        newEmployee.professionalInfo[section][index][field] = value;
        setEmployee(newEmployee);
    }
    
    const handleArrayChange = (field: 'skills' | 'certifications', value: string) => {
        const newEmployee = JSON.parse(JSON.stringify(employee));
        if (!newEmployee.professionalInfo) {
            newEmployee.professionalInfo = { experience: [], education: [], skills: [], certifications: [] };
        }
        newEmployee.professionalInfo[field] = value.split(',').map(s => s.trim()).filter(Boolean);
        setEmployee(newEmployee);
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary"/> Work Experience</CardTitle>
                    {isEditing && <Button variant="outline" size="sm" onClick={() => handleAddItem('experience')}><Plus className="mr-2 h-4 w-4" /> Add</Button>}
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {professionalInfo.experience.map((exp: any, i: number) => (
                            <div key={i} className="flex gap-4 p-2 rounded-md relative group">
                                <div className="p-3 bg-muted rounded-lg h-fit"><Briefcase className="h-5 w-5 text-muted-foreground"/></div>
                                {isEditing ? (
                                    <div className="flex-1 space-y-2">
                                        <Input placeholder="Role" value={exp.role} onChange={(e) => handleFieldChange('experience', i, 'role', e.target.value)} />
                                        <Input placeholder="Company" value={exp.company} onChange={(e) => handleFieldChange('experience', i, 'company', e.target.value)} />
                                        <Input placeholder="Dates" value={exp.dates} onChange={(e) => handleFieldChange('experience', i, 'dates', e.target.value)} />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-semibold">{exp.role}</p>
                                        <p className="text-sm text-muted-foreground">{exp.company} &middot; {exp.dates}</p>
                                    </div>
                                )}
                                {isEditing && <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveItem('experience', i)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary"/> Education</CardTitle>
                    {isEditing && <Button variant="outline" size="sm" onClick={() => handleAddItem('education')}><Plus className="mr-2 h-4 w-4" /> Add</Button>}
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {professionalInfo.education.map((edu: any, i: number) => (
                            <div key={i} className="flex gap-4 p-2 rounded-md relative group">
                                <div className="p-3 bg-muted rounded-lg h-fit"><Award className="h-5 w-5 text-muted-foreground"/></div>
                                 {isEditing ? (
                                    <div className="flex-1 space-y-2">
                                        <Input placeholder="Degree" value={edu.degree} onChange={(e) => handleFieldChange('education', i, 'degree', e.target.value)} />
                                        <Input placeholder="Institution" value={edu.institution} onChange={(e) => handleFieldChange('education', i, 'institution', e.target.value)} />
                                        <Input placeholder="Year" value={edu.year} onChange={(e) => handleFieldChange('education', i, 'year', e.target.value)} />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-semibold">{edu.degree}</p>
                                        <p className="text-sm text-muted-foreground">{edu.institution} &middot; {edu.year}</p>
                                    </div>
                                )}
                                {isEditing && <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveItem('education', i)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary"/> Skills & Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <h4 className="font-semibold mb-2">Skills</h4>
                        {isEditing ? (
                             <Textarea placeholder="Comma-separated skills..." value={(professionalInfo.skills || []).join(', ')} onChange={(e) => handleArrayChange('skills', e.target.value)} />
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {professionalInfo.skills.map((skill: string) => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    <Separator className="my-4"/>
                    <div>
                        <h4 className="font-semibold mb-2">Certifications</h4>
                         {isEditing ? (
                             <Textarea placeholder="Comma-separated certifications..." value={(professionalInfo.certifications || []).join(', ')} onChange={(e) => handleArrayChange('certifications', e.target.value)} />
                        ) : (
                            <ul className="space-y-2">
                                {professionalInfo.certifications.map((cert: string, i: number) => (
                                    <li key={i} className="text-sm">
                                        {cert}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
