
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogIn, LogOut, CameraOff, MapPin, Loader2, UserCheck, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyFaceAction } from './actions';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

// In a real app, this URI would come from user data, pointing to a secure storage location.
// For this prototype, we use a placeholder that will resolve to an image.
const MOCK_PROFILE_IMAGE_URI = 'https://placehold.co/400x400.png';

type AttendanceLog = {
  type: 'check-in' | 'check-out';
  time: string;
  verified: boolean;
};

export default function AttendancePage() {
  const [status, setStatus] = useState('Checked Out');
  const [lastActionTime, setLastActionTime] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendanceLog, setAttendanceLog] = useState<AttendanceLog[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not supported.');
        setHasCameraPermission(false);
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
      }
    };

    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, []);
  
  const captureImage = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };

  const handleAction = async (type: 'check-in' | 'check-out') => {
    setIsProcessing(true);
    const captureImageUri = captureImage();

    if (!captureImageUri) {
      toast({ variant: 'destructive', title: 'Capture Failed', description: 'Could not capture image from camera.' });
      setIsProcessing(false);
      return;
    }
    
    // In a real app, you would fetch a data URI for the user's actual profile photo.
    // For now, we simulate this by fetching the placeholder and converting it to a data URI.
    const response = await fetch(MOCK_PROFILE_IMAGE_URI);
    const blob = await response.blob();
    const profileImageUri = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });


    try {
      const verificationResult = await verifyFaceAction({
        profileImageUri: profileImageUri,
        captureImageUri,
      });

      if (verificationResult.isSamePerson && verificationResult.confidence > 0.7) {
        const currentTime = new Date().toLocaleTimeString();
        setStatus(type === 'check-in' ? 'Checked In' : 'Checked Out');
        setLastActionTime(currentTime);
        setAttendanceLog(prev => [{ type, time: currentTime, verified: true }, ...prev]);
        toast({
          title: 'Success',
          description: `Verified and checked ${type === 'check-in' ? 'in' : 'out'} at ${currentTime}.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: verificationResult.reasoning || 'Could not verify your identity. Please try again.',
        });
      }
    } catch(err) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: (err as Error).message,
        });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
    <Card className="lg:col-span-2">
        <CardHeader>
        <CardTitle>Live Check-in / Check-out</CardTitle>
        <CardDescription>
            Your identity will be verified using your profile picture. Look at the camera and click the appropriate button.
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="relative aspect-square w-full max-w-sm mx-auto bg-muted rounded-lg overflow-hidden border">
                <video ref={videoRef} className="h-full w-full object-cover scale-x-[-1]" autoPlay muted playsInline />
                {!hasCameraPermission && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                    <CameraOff className="h-12 w-12 mb-4" />
                    <h3 className="text-lg font-semibold">Camera Access Denied</h3>
                    <p className="text-center text-sm">Please enable camera permissions in your browser settings to use this feature.</p>
                </div>
                )}
            </div>
            <div className="relative aspect-square w-full max-w-sm mx-auto bg-muted rounded-lg overflow-hidden border flex flex-col items-center justify-center">
                <Image src={MOCK_PROFILE_IMAGE_URI} alt="Profile" width={400} height={400} className="h-full w-full object-cover" data-ai-hint="person face" />
                <Badge variant="secondary" className="absolute bottom-2">Your Profile Picture</Badge>
            </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
            size="lg"
            onClick={() => handleAction('check-in')}
            disabled={isProcessing || status === 'Checked In' || !hasCameraPermission}
            className="h-14 text-lg"
            >
            {isProcessing && status === 'Checked Out' ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <LogIn className="mr-2 h-6 w-6" />} 
            Check In
            </Button>
            <Button
            size="lg"
            variant="destructive"
            onClick={() => handleAction('check-out')}
            disabled={isProcessing || status === 'Checked Out' || !hasCameraPermission}
            className="h-14 text-lg"
            >
            {isProcessing && status === 'Checked In' ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <LogOut className="mr-2 h-6 w-6" />}
            Check Out
            </Button>
        </div>
        <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                Your image is captured for identity verification and is not stored. This action is logged for security purposes.
                </AlertDescription>
            </Alert>
        </CardContent>
    </Card>

    <div className="space-y-6 lg:col-span-1">
        <Card>
        <CardHeader>
            <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className={`p-4 rounded-md text-center ${status === 'Checked In' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <p className={`text-2xl font-bold ${status === 'Checked In' ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
                    {status}
                </p>
                {lastActionTime && <p className="text-sm text-muted-foreground">at {lastActionTime}</p>}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Location: Bangalore, India (Approx.)</span>
            </div>
        </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Today's Log</CardTitle>
            </CardHeader>
            <CardContent>
                {attendanceLog.length > 0 ? (
                    <ul className="space-y-3">
                        {attendanceLog.map((log, index) => (
                            <li key={index} className="flex items-center justify-between text-sm">
                                <div className='flex items-center gap-3'>
                                    {log.type === 'check-in' ? <LogIn className='h-4 w-4 text-green-500'/> : <LogOut className='h-4 w-4 text-red-500'/>}
                                    <span className='font-medium'>{log.type === 'check-in' ? 'Checked In' : 'Checked Out'}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {log.verified && <Badge variant="outline" className="text-green-600 border-green-600"><UserCheck className="h-3 w-3 mr-1"/>Verified</Badge>}
                                    <span className='text-muted-foreground'>{log.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No activity yet for today.</p>
                )}
            </CardContent>
        </Card>
    </div>
    </div>
  );
}
