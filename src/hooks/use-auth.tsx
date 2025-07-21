
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initialEmployees } from '@/app/[role]/employees/page';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // We will create this file

interface User {
  email: string;
  role: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter' | 'qa-analyst' | 'process-manager' | 'team-leader' | 'marketing' | 'finance' | 'it-manager' | 'operations-manager';
  employeeId?: string;
  isNew?: boolean;
  profile?: {
    name?: string;
    department?: string;
    profilePicture?: string;
    language?: string;
    resumeUrl?: string;
    status?: string;
  }
}

// Mock database of users. In a real app, this comes from your backend (e.g., Firestore).
const mockUsersDb: Record<string, User> = {
    'olivia.martin@email.com': { email: 'olivia.martin@email.com', role: 'admin' },
    'manager@optitalent.com': { email: 'manager@optitalent.com', role: 'manager' },
    'hr@optitalent.com': { email: 'hr@optitalent.com', role: 'hr' },
    'anika.sharma@email.com': { email: 'anika.sharma@email.com', role: 'employee' },
    'recruiter@optitalent.com': { email: 'recruiter@optitalent.com', role: 'recruiter' },
    'qa@optitalent.com': { email: 'qa@optitalent.com', role: 'qa-analyst' },
    'pm@optitalent.com': { email: 'pm@optitalent.com', role: 'process-manager' },
    'team-leader@optitalent.com': { email: 'team-leader@optitalent.com', role: 'team-leader' },
    'marketing.head@optitalent.com': { email: 'marketing.head@optitalent.com', role: 'marketing' },
    'finance.mgr@optitalent.com': { email: 'finance.mgr@optitalent.com', role: 'finance' },
    'it.mgr@optitalent.com': { email: 'it.mgr@optitalent.com', role: 'it-manager' },
    'operations.mgr@optitalent.com': { email: 'operations.mgr@optitalent.com', role: 'operations-manager' },
};


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, newUserProfile?: User) => Promise<User | null>;
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
    // This effect now primarily handles restoring session from localStorage
    // The Firebase onAuthStateChanged listener will handle the real auth state
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

  const login = async (email: string, password: string, newUserProfile?: User): Promise<User | null> => {
    // This is a simulation. In a real Firebase app, you'd use signInWithEmailAndPassword
    // For portfolio purposes, we'll check against our mock DB.
    
    // Simulate sign-up
    if (newUserProfile) {
        mockUsersDb[email] = newUserProfile;
    }

    const foundUser = mockUsersDb[email.toLowerCase()];

    if (!foundUser) {
        throw new Error("No user found with this email.");
    }
    
    // In a real app, password would be checked by Firebase. Here we just accept it.
    
    // In a real app, you would fetch this from a DB (like Firestore). For now, find the mock user.
    const fullUserProfile = initialEmployees.find(emp => emp.email === foundUser.email);

    if (fullUserProfile) {
      foundUser.profile = {
        name: fullUserProfile.name,
        department: fullUserProfile.department,
        status: fullUserProfile.status,
      }
      foundUser.employeeId = fullUserProfile.id;
    } else if (newUserProfile) {
        foundUser.profile = newUserProfile.profile;
        foundUser.isNew = true;
    }

    localStorage.setItem('user', JSON.stringify(foundUser));
    setUser(foundUser);
    return foundUser;
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
