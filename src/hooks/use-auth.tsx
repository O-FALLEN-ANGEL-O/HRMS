
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { mockUsers, type User } from '@/lib/mock-data/employees';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  login: (identifier: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  signUp: (data: any) => Promise<{ error: { message: string } | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
        const storedUserId = sessionStorage.getItem('loggedInUserId');
        if (storedUserId) {
            const loggedInUser = mockUsers.find(u => u.profile.employee_id === storedUserId || u.id === storedUserId);
            if(loggedInUser) {
                setUser(loggedInUser);
            }
        }
    } catch(e) {
        console.error("Could not access session storage. This is expected in SSR.")
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (identifier: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === identifier.toLowerCase() || u.profile.employee_id.toLowerCase() === identifier.toLowerCase()
    );

    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('loggedInUserId', foundUser.id);
      router.push(`/${foundUser.role}/dashboard`);
      setLoading(false);
      return { error: null };
    } else {
      setLoading(false);
      return { error: { message: "Invalid credentials. Please try again." } };
    }
  }, [router]);
  
  const signUp = async (data: any) => {
    console.log("Mock sign up with:", data);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email,
        role: 'employee',
        profile: {
            id: `profile-${Date.now()}`,
            full_name: `${data.firstName} ${data.lastName}`,
            department: { name: 'Unassigned' },
            department_id: 'd-tba',
            job_title: 'New Hire',
            role: 'employee',
            employee_id: `NEW-${String(mockUsers.length + 1).padStart(4,'0')}`,
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=random`,
            phone_number: 'N/A'
        }
    };
    mockUsers.push(newUser);
    setUser(newUser);
    sessionStorage.setItem('loggedInUserId', newUser.id);
    router.push(`/${newUser.role}/dashboard`);
    return { error: null };
  }

  const logout = async () => {
    setUser(null);
    setSearchTerm('');
    sessionStorage.removeItem('loggedInUserId');
    router.push('/');
  };

  const value = { user, loading, searchTerm, setSearchTerm, login, logout, signUp };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
