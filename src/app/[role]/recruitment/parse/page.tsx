"use client"

import React, { useState, useRef, useEffect } from 'react';
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
import { scoreAndParseResume, ScoreAndParseResumeOutput } from '@/ai/flows/score-and-parse-resume';
import { Bot, Upload, Camera, Loader2, Save, Trash2, PlusCircle, FileText, Smartphone } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type ParsedData = ScoreAndParseResumeOutput['parsedData'];

export default function ParseResumePage() {
  const [result, setResult] = useState<ScoreAndParseResumeOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("Senior Software Engineer with experience in React, TypeScript, and Node.js. Must have 5+ years of experience and strong problem-solving skills.");
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const [editData, setEditData] = useState<ParsedData | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!isCameraOpen) {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
        setIsCameraOpen(false);
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }

  }, [isCameraOpen, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResumeDataUri(null); // Reset before reading new file
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeDataUri(e.target?.result as string);
        setIsCameraOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL('image/jpeg');
      setResumeDataUri(dataUri);
      setFileName('camera_capture.jpg');
      setIsCameraOpen(false);
    }
  };

  const handleParseResume = async () => {
    if (!resumeDataUri) {
      toast({ title: "No Resume", description: "Please upload or capture a resume image.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    setEditData(null);
    try {
      const response = await scoreAndParseResume({ jobDescription, resumeDataUri });
      setResult(response);
      setEditData(response.parsedData);
      toast({ title: "Analysis Complete", description: "Resume has been parsed and scored." });
    } catch (e) {
      console.error(e);
      toast({ title: "Analysis Failed", description: "There was an error parsing the resume.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (section: 'workExperience' | 'education', index: number, field: string, value: string) => {
    if (!editData) return;
    const newData = { ...editData };
    (newData[section] as any[])[index][field] = value;
    setEditData(newData);
  };
  
  const handleSimpleFieldChange = (field: keyof ParsedData, value: string | string[]) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };
  
  const handleArrayChange = (field: 'skills' | 'links' | 'certifications' | 'languages', value: string) => {
     if (!editData) return;
     setEditData({ ...editData, [field]: value.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const handleAddItem = (section: 'workExperience' | 'education') => {
    if (!editData) return;
    const newData = { ...editData };
    if (section === 'workExperience') {
      (newData.workExperience as any[]).unshift({ company: '', title: '', dates: '' });
    } else if (section === 'education') {
      (newData.education as any[]).unshift({ institution: '', degree: '', year: '' });
    }
    setEditData(newData);
  };
  
  const handleRemoveItem = (section: 'workExperience' | 'education', index: number) => {
    if (!editData) return;
    const newData = { ...editData };
    (newData[section] as any[]).splice(index, 1);
    setEditData(newData);
  };

  const handleSave = () => {
    // In a real application, you would save `editData` to your database.
    console.log("Saving data:", editData);
    toast({ title: "Profile Saved", description: "The candidate's profile has been saved to the console." });
    resetAll();
  };
  
  const resetAll = () => {
    setResult(null);
    setEditData(null);
    setResumeDataUri(null);
    setFileName(null);
    setIsCameraOpen(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Parse & Score Resume</h1>
        <p className="text-muted-foreground">Upload a resume to automatically parse details and score against a job description.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                placeholder="Paste the job description here..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Upload Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="mr-2" /> Upload File
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                <Button variant="outline" className="w-full" onClick={() => setIsCameraOpen(prev => !prev)}>
                  <Camera className="mr-2" /> {isCameraOpen ? 'Close Camera' : 'Use Camera'}
                </Button>
              </div>
              {fileName && <p className="text-sm text-muted-foreground mt-4">File selected: {fileName}</p>}
              
              {isCameraOpen && (
                <div className="mt-4 space-y-2">
                   <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                   <canvas ref={canvasRef} className="hidden" />
                   {hasCameraPermission === false && (
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                        </Alert>
                   )}
                   <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">Capture Photo</Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleParseResume} disabled={loading || !resumeDataUri} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Analyzing..." : "Parse & Score Resume"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>3. Review & Edit Parsed Data</CardTitle>
              <CardDescription>Review the AI-extracted data. You can edit any field before saving the candidate profile.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">AI is parsing and scoring the resume...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a moment.</p>
                </div>
              )}
              
              {!loading && !result && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-accent rounded-full">
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="p-4 bg-accent rounded-full">
                        <Smartphone className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <p className="mt-6 text-muted-foreground">Results will be displayed here after analysis.</p>
                </div>
              )}

              {result && editData && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Match Score</CardTitle>
                      <CardDescription>Based on the provided job description.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24">
                          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <circle className="text-muted/20" cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4"></circle>
                            <circle className="text-primary transition-all duration-500" cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4" strokeDasharray={`${result.score}, 100`} strokeLinecap="round"></circle>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold font-headline">{result.score}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground flex-1">{result.justification}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Contact Information</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={editData.name || ''} onChange={(e) => handleSimpleFieldChange('name', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={editData.email || ''} onChange={(e) => handleSimpleFieldChange('email', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={editData.phone || ''} onChange={(e) => handleSimpleFieldChange('phone', e.target.value)} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Work Experience</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <Button variant="outline" size="sm" onClick={() => handleAddItem('workExperience')}><PlusCircle className="mr-2 h-4 w-4"/>Add Experience</Button>
                        {editData.workExperience.map((exp, index) => (
                          <div key={index} className="space-y-2 p-3 border rounded-md relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input placeholder="Company" value={exp.company} onChange={e => handleFieldChange('workExperience', index, 'company', e.target.value)} />
                              <Input placeholder="Job Title" value={exp.title} onChange={e => handleFieldChange('workExperience', index, 'title', e.target.value)} />
                            </div>
                            <Input placeholder="Dates (e.g., Jan 2020 - Present)" value={exp.dates} onChange={e => handleFieldChange('workExperience', index, 'dates', e.target.value)} />
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleRemoveItem('workExperience', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>Education</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                         <Button variant="outline" size="sm" onClick={() => handleAddItem('education')}><PlusCircle className="mr-2 h-4 w-4"/>Add Education</Button>
                        {editData.education.map((edu, index) => (
                          <div key={index} className="space-y-2 p-3 border rounded-md relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input placeholder="Institution" value={edu.institution} onChange={e => handleFieldChange('education', index, 'institution', e.target.value)} />
                              <Input placeholder="Degree" value={edu.degree} onChange={e => handleFieldChange('education', index, 'degree', e.target.value)} />
                            </div>
                            <Input placeholder="Year" value={edu.year} onChange={e => handleFieldChange('education', index, 'year', e.target.value)} />
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleRemoveItem('education', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Skills & Qualifications</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Skills (comma separated)</Label>
                            <Textarea value={(editData.skills || []).join(', ')} onChange={(e) => handleArrayChange('skills', e.target.value)} />
                          </div>
                           <div>
                            <Label>Languages (comma separated)</Label>
                            <Textarea value={(editData.languages || []).join(', ')} onChange={(e) => handleArrayChange('languages', e.target.value)} />
                          </div>
                           <div>
                            <Label>Links (comma separated)</Label>
                            <Textarea value={(editData.links || []).join(', ')} onChange={(e) => handleArrayChange('links', e.target.value)} />
                          </div>
                          <div>
                            <Label>Certifications (comma separated)</Label>
                            <Textarea value={(editData.certifications || []).join(', ')} onChange={(e) => handleArrayChange('certifications', e.target.value)} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={resetAll}>Cancel & Clear</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Candidate Profile</Button>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
