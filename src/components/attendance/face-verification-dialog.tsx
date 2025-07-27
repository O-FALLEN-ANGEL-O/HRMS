
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { verifyFaceAction } from '@/app/[role]/attendance/actions';

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'failed';

interface FaceVerificationDialogProps {
  onVerificationSuccess: () => void;
}

export function FaceVerificationDialog({ onVerificationSuccess }: FaceVerificationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
  const [verificationResult, setVerificationResult] = useState<{ isSamePerson: boolean; confidence: number; reasoning: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const openCamera = useCallback(async () => {
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
      setIsOpen(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (isOpen) {
      openCamera();
    } else {
      // Cleanup: stop camera stream when dialog is closed
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      // Reset state on close
      setCapturedImage(null);
      setVerificationStatus('idle');
      setVerificationResult(null);
    }
  }, [isOpen, openCamera]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
      }
    }
  };

  const handleVerify = async () => {
    if (!capturedImage || !user?.profile.profile_picture_url) {
      toast({ title: 'Error', description: 'Missing captured image or profile picture.', variant: 'destructive' });
      return;
    }
    setVerificationStatus('verifying');
    try {
      const result = await verifyFaceAction({
        profileImageUri: user.profile.profile_picture_url,
        captureImageUri: capturedImage,
      });
      setVerificationResult(result);
      if (result.isSamePerson) {
        setVerificationStatus('success');
        onVerificationSuccess();
        toast({ title: 'Clock-in/out Successful!', description: `Attendance recorded for ${user.profile.full_name.split(' ')[0]}.`});
        setTimeout(() => setIsOpen(false), 1500); // Close dialog after success
      } else {
        setVerificationStatus('failed');
      }
    } catch (e) {
      console.error(e);
      setVerificationStatus('failed');
      setVerificationResult({ isSamePerson: false, confidence: 0, reasoning: 'An error occurred during verification.' });
      toast({ title: 'Verification Failed', description: 'Could not complete verification.', variant: 'destructive' });
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setVerificationStatus('idle');
    setVerificationResult(null);
    openCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Camera className="mr-2 h-4 w-4" /> Clock In/Out
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Face Verification</DialogTitle>
          <DialogDescription>
            Center your face in the camera to clock in or out.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <canvas ref={canvasRef} className="hidden" />
          {verificationStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">Verification Successful!</h3>
              <p className="text-muted-foreground">Confidence: {(verificationResult?.confidence ?? 0) * 100}%</p>
            </div>
          ) : verificationStatus === 'failed' ? (
             <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Verification Failed</h3>
              <p className="text-muted-foreground">{verificationResult?.reasoning}</p>
              <p className="text-sm text-muted-foreground mt-2">Confidence: {(verificationResult?.confidence ?? 0) * 100}%</p>
            </div>
          ) : (
            <div className="relative aspect-video w-full">
              <video ref={videoRef} className="w-full h-full rounded-md bg-muted" autoPlay muted playsInline />
              {capturedImage && (
                <img src={capturedImage} alt="Captured face" className="absolute inset-0 w-full h-full rounded-md" />
              )}
            </div>
          )}

          {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>Please allow camera access in your browser to use this feature.</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          {verificationStatus === 'idle' && !capturedImage && (
            <Button onClick={handleCapture} disabled={!hasCameraPermission} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> Capture
            </Button>
          )}
           {verificationStatus === 'idle' && capturedImage && (
            <>
              <Button variant="outline" onClick={() => setCapturedImage(null)}>Retake</Button>
              <Button onClick={handleVerify}>Verify</Button>
            </>
          )}
          {verificationStatus === 'verifying' && (
             <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Verifying...
             </Button>
          )}
          {(verificationStatus === 'success' || verificationStatus === 'failed') && (
            <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
