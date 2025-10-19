'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { PartyPopper } from 'lucide-react';

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This component will only show once for new users after they sign up or are created.
    const isNew = sessionStorage.getItem('isNewUser');
    if (isNew === 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.removeItem('isNewUser');
    setIsOpen(false);
  };

  const goToProfile = () => {
    if (user) {
        router.push(`/${user.role}/profile`);
    }
    handleClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
            <div className="flex justify-center mb-4">
                <PartyPopper className="h-16 w-16 text-primary" />
            </div>
          <DialogTitle className="text-center text-2xl font-headline">Welcome to OptiTalent!</DialogTitle>
          <DialogDescription className="text-center">
            We're thrilled to have you on board. Your account has been successfully created.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-muted-foreground">
            We recommend completing your profile to get the most out of the platform.
          </p>
        </div>
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={handleClose}>
            Skip for Now
          </Button>
          <Button onClick={goToProfile}>
            Go to My Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
