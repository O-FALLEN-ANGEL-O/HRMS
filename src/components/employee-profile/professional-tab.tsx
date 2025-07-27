
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, History, Award, Briefcase, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { professionalInfo } from '@/lib/mock-data/professional-info';

export function ProfessionalTab() {
     const { toast } = useToast();
     const handleAdd = (section: string) => toast({title: `Add ${section}`, description: "This would open a form dialog."});
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary"/> Work Experience</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleAdd('Experience')}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {professionalInfo.experience.map((exp, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="p-3 bg-muted rounded-lg h-fit"><Briefcase className="h-5 w-5 text-muted-foreground"/></div>
                                <div>
                                    <p className="font-semibold">{exp.role}</p>
                                    <p className="text-sm text-muted-foreground">{exp.company} &middot; {exp.dates}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary"/> Education</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleAdd('Education')}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {professionalInfo.education.map((edu, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="p-3 bg-muted rounded-lg h-fit"><Award className="h-5 w-5 text-muted-foreground"/></div>
                                <div>
                                    <p className="font-semibold">{edu.degree}</p>
                                    <p className="text-sm text-muted-foreground">{edu.institution} &middot; {edu.year}</p>
                                </div>
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
                        <div className="flex flex-wrap gap-2">
                            {professionalInfo.skills.map(skill => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    </div>
                    <Separator className="my-4"/>
                    <div>
                        <h4 className="font-semibold mb-2">Certifications</h4>
                        <ul className="space-y-2">
                            {professionalInfo.certifications.map((cert, i) => (
                                <li key={i} className="text-sm">
                                    <span className="font-medium">{cert.name}</span> - <span className="text-muted-foreground">{cert.authority}, {cert.year}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
