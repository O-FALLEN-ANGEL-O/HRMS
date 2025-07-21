
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initialEmployees } from '@/app/[role]/employees/page';

interface User {
  email: string;
  role: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter' | 'qa-analyst' | 'process-manager' | 'team-leader' | 'marketing' | 'finance' | 'it-manager';
  employeeId?: string;
  isNew?: boolean;
  // This would be expanded in a real app
  profile?: {
    name?: string;
    department?: string;
    profilePicture?: string;
    language?: string;
    resumeUrl?: string;
    status?: string;
  }
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error)
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    // In a real app, you'd fetch this from a DB. For now, find the mock user.
    const fullUserProfile = initialEmployees.find(emp => emp.email === userData.email);

    if (fullUserProfile) {
      userData.profile = {
        name: fullUserProfile.name,
        department: fullUserProfile.department,
        status: fullUserProfile.status,
      }
    } else if (userData.role === 'employee' && !userData.profile) {
       userData.profile = {
          name: userData.isNew ? 'New Employee' : 'Alex Doe',
          department: 'Technology',
          status: 'Active'
      };
    } else if (userData.role === 'process-manager' && !userData.profile) {
      userData.profile = { name: 'Process Manager', department: 'Operations' }
    } else if(userData.role === 'qa-analyst' && !userData.profile) {
       userData.profile = { name: 'QA Analyst', department: 'Quality' }
    } else if(userData.role === 'marketing' && !userData.profile) {
       userData.profile = { name: 'Marketing Head', department: 'Marketing' }
    } else if(userData.role === 'finance' && !userData.profile) {
       userData.profile = { name: 'Finance Head', department: 'Finance' }
    } else if(userData.role === 'it-manager' && !userData.profile) {
       userData.profile = { name: 'IT Manager', department: 'IT' }
    }


    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = { user, login, logout, loading, searchTerm, setSearchTerm };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
