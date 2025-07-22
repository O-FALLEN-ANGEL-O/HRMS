

"use client"

import { useState, useEffect } from 'react';
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function SignupPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const [passwordCriteria, setPasswordCriteria] = useState({
      length: false,
      uppercase: false,
      number: false,
      specialChar: false,
    });

    useEffect(() => {
        const checkPassword = () => {
            setPasswordCriteria({
                length: formData.password.length >= 8,
                uppercase: /[A-Z]/.test(formData.password),
                number: /[0-9]/.test(formData.password),
                specialChar: /[^A-Za-z0-9]/.test(formData.password),
            });
        };
        checkPassword();
    }, [formData.password]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // This is a mock signup
        setTimeout(() => {
            toast({
                title: "Account Created! (Mock)",
                description: "This is a frontend prototype. No account was actually created.",
            });
            router.push(`/`);
            setLoading(false);
        }, 1000);
    };
    
    const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
      <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
        {met ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
        {text}
      </div>
    );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="mx-auto max-w-sm">
        <CardHeader className="text-center">
            <Logo className="justify-center mb-4"/>
            <CardTitle className="text-2xl font-headline">Create your account</CardTitle>
            <CardDescription>
            Enter your information to get started
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="Max" required value={formData.firstName} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Robinson" required value={formData.lastName} onChange={handleInputChange} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={handleInputChange}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={formData.password} onChange={handleInputChange}/>
            </div>
            
            <div className="space-y-1 mt-2">
              <CriteriaItem met={passwordCriteria.length} text="At least 8 characters" />
              <CriteriaItem met={passwordCriteria.uppercase} text="One uppercase letter" />
              <CriteriaItem met={passwordCriteria.number} text="One number" />
              <CriteriaItem met={passwordCriteria.specialChar} text="One special character" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create an account
            </Button>
            <Button variant="outline" className="w-full" type="button" disabled={loading}>
                Sign up with Google
            </Button>
            </form>
            <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline">
                Sign in
            </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}
