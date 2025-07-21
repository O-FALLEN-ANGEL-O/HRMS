
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
    // Admin/Manager users (keyed by email)
    'olivia.martin@email.com': { email: 'olivia.martin@email.com', role: 'admin' },
    'manager@optitalent.com': { email: 'manager@optitalent.com', role: 'manager' },
    'hr@optitalent.com': { email: 'hr@optitalent.com', role: 'hr' },
    'recruiter@optitalent.com': { email: 'recruiter@optitalent.com', role: 'recruiter' },
    'qa@optitalent.com': { email: 'qa@optitalent.com', role: 'qa-analyst' },
    'pm@optitalent.com': { email: 'pm@optitalent.com', role: 'process-manager' },
    'team-leader@optitalent.com': { email: 'team-leader@optitalent.com', role: 'team-leader' },
    'marketing.head@optitalent.com': { email: 'marketing.head@optitalent.com', role: 'marketing' },
    'finance.mgr@optitalent.com': { email: 'finance.mgr@optitalent.com', role: 'finance' },
    'it.mgr@optitalent.com': { email: 'it.mgr@optitalent.com', role: 'it-manager' },
    'operations.mgr@optitalent.com': { email: 'operations.mgr@optitalent.com', role: 'operations-manager' },
    
    // Employee users (keyed by Employee ID)
    'PEP04': { email: 'employee@hrplus.com', role: 'employee', employeeId: 'PEP04' },
    'PEP06': { email: 'anika.sharma@email.com', role: 'employee', employeeId: 'PEP06' },
};

// Simulate which users have "registered" by setting a password.
const registeredUsers = new Set(['PEP06']);


interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string, newUserProfile?: User) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  checkEmployeeId: (employeeId: string) => Promise<{ exists: boolean; isRegistered: boolean }>;
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

  const login = async (identifier: string, password: string, newUserProfile?: User): Promise<User | null> => {
    // This is a simulation.
    // Identifier can be an email or an Employee ID.
    
    if (newUserProfile) {
        mockUsersDb[identifier] = newUserProfile;
    }

    const foundUser = mockUsersDb[identifier.toLowerCase()];

    if (!foundUser) {
        throw new Error("No user found with this identifier.");
    }
    
    // In a real app, password would be checked by Firebase. Here we just accept it.
    
    const fullUserProfile = initialEmployees.find(emp => emp.email === foundUser.email || emp.id === foundUser.employeeId);

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

  const checkEmployeeId = async (employeeId: string): Promise<{ exists: boolean; isRegistered: boolean }> => {
    // Simulate API call to check employee ID
    await new Promise(resolve => setTimeout(resolve, 500));
    const userExists = !!mockUsersDb[employeeId.toUpperCase()];
    const isRegistered = registeredUsers.has(employeeId.toUpperCase());
    return { exists: userExists, isRegistered };
  }

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = { user, login, logout, loading, searchTerm, setSearchTerm, checkEmployeeId };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
