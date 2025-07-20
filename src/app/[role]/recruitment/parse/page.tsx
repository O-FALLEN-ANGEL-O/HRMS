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
import { Bot, Upload, Camera, Loader2, Save, Trash2, PlusCircle } from 'lucide-react';
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
        // Stop camera stream when not in use
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
        // Cleanup on unmount
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

  const handleFieldChange = (section: keyof ParsedData, index: number, field: string, value: string) => {
    if (!editData) return;
    const newData = { ...editData };
    (newData[section] as any[])[index][field] = value;
    setEditData(newData);
  };
  
  const handleSimpleFieldChange = (field: keyof ParsedData, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const handleAddItem = (section: keyof ParsedData) => {
    if (!editData) return;
    const newData = { ...editData };
    if (section === 'workExperience') {
      (newData.workExperience as any[]).push({ company: '', title: '', dates: '' });
    } else if (section === 'education') {
      (newData.education as any[]).push({ institution: '', degree: '', year: '' });
    } else if (section === 'skills' || section === 'links') {
      (newData[section] as any[]).push('');
    }
    setEditData(newData);
  };
  
  const handleRemoveItem = (section: keyof ParsedData, index: number) => {
    if (!editData) return;
    const newData = { ...editData };
    (newData[section] as any[]).splice(index, 1);
    setEditData(newData);
  };

  const handleSave = () => {
    // In a real application, you would save `editData` to your database.
    console.log("Saving data:", editData);
    toast({ title: "Profile Saved", description: "The candidate's profile has been saved." });
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
              <CardDescription>Enter the job description to score the resume against.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Upload Resume</CardTitle>
              <CardDescription>Upload a file (.pdf, .docx, .jpg, .png) or use your camera.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,image/*" />
              <Button onClick={() => fileInputRef.current?.click()} className="w-full mb-2">
                <Upload className="mr-2 h-4 w-4" /> Upload File
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsCameraOpen(prev => !prev)}>
                <Camera className="mr-2 h-4 w-4" /> {isCameraOpen ? 'Close Camera' : 'Use Camera'}
              </Button>
              {fileName && <p className="text-sm text-muted-foreground mt-2">File: {fileName}</p>}
              
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
              <CardTitle>3. Review & Edit</CardTitle>
              <CardDescription>Review the parsed data and make any necessary edits before saving.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">AI is parsing and scoring the resume...</p>
                </div>
              )}
              
              {!loading && !result && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Results will be displayed here after analysis.</p>
                </div>
              )}

              {result && editData && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24">
                          <svg className="h-full w-full" viewBox="0 0 36 36">
                            <path className="text-muted" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4"></path>
                            <path className="text-primary" strokeDasharray={`${result.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4" strokeLinecap="round"></path>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">{result.score}</span>
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
                            <Input value={editData.name} onChange={(e) => handleSimpleFieldChange('name', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={editData.email} onChange={(e) => handleSimpleFieldChange('email', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={editData.phone} onChange={(e) => handleSimpleFieldChange('phone', e.target.value)} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Work Experience</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {editData.workExperience.map((exp, index) => (
                          <div key={index} className="space-y-2 p-3 border rounded-md relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input placeholder="Company" value={exp.company} onChange={e => handleFieldChange('workExperience', index, 'company', e.target.value)} />
                              <Input placeholder="Job Title" value={exp.title} onChange={e => handleFieldChange('workExperience', index, 'title', e.target.value)} />
                            </div>
                            <Input placeholder="Dates (e.g., Jan 2020 - Present)" value={exp.dates} onChange={e => handleFieldChange('workExperience', index, 'dates', e.target.value)} />
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleRemoveItem('workExperience', index)}><Trash2 className="h-4 w-4"/></Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddItem('workExperience')}><PlusCircle className="mr-2 h-4 w-4"/>Add Experience</Button>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Education</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {editData.education.map((edu, index) => (
                          <div key={index} className="space-y-2 p-3 border rounded-md relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input placeholder="Institution" value={edu.institution} onChange={e => handleFieldChange('education', index, 'institution', e.target.value)} />
                              <Input placeholder="Degree" value={edu.degree} onChange={e => handleFieldChange('education', index, 'degree', e.target.value)} />
                            </div>
                            <Input placeholder="Year" value={edu.year} onChange={e => handleFieldChange('education', index, 'year', e.target.value)} />
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleRemoveItem('education', index)}><Trash2 className="h-4 w-4"/></Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddItem('education')}><PlusCircle className="mr-2 h-4 w-4"/>Add Education</Button>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Skills & Links</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Skills (comma separated)</Label>
                            <Textarea value={editData.skills.join(', ')} onChange={(e) => setEditData({...editData, skills: e.target.value.split(',').map(s=>s.trim())})} />
                          </div>
                          <div>
                            <Label>Links (comma separated)</Label>
                            <Textarea value={editData.links.join(', ')} onChange={(e) => setEditData({...editData, links: e.target.value.split(',').map(s=>s.trim())})} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetAll}>Cancel</Button>
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
