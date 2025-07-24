
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { mockUsers, type User } from '@/lib/mock-data/employees';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  login: (employeeId: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  signUp: (data: any) => Promise<{ error: { message: string } | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for a user in session storage on initial load
    try {
      const storedUser = sessionStorage.getItem('authUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse auth user from session storage", error)
      sessionStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (employeeId: string) => {
    setLoading(true);
    const userToLogin = mockUsers.find(u => u.profile.employee_id === employeeId);

    if (userToLogin) {
      setUser(userToLogin);
      sessionStorage.setItem('authUser', JSON.stringify(userToLogin));
      router.push(`/${userToLogin.role}/dashboard`);
      setLoading(false);
      return { error: null };
    } else {
      setLoading(false);
      return { error: { message: "Invalid Employee ID." } };
    }
  };
  
  const signUp = async (data: any) => {
    setLoading(true);
    // This is a mock function and needs to be connected to Supabase auth signup
    console.log("Mock sign up with:", data);
    // Simulate a network delay
    await new Promise(res => setTimeout(res, 1000));
    
    // For now, just log in as a default employee for demo purposes
    await login('PEP0012');
    setLoading(false);
    return { error: null };
  }

  const logout = async () => {
    setUser(null);
    sessionStorage.removeItem('authUser');
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
