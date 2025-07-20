
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  role: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    // In a real app, you'd fetch profile data from a DB here.
    // For now, we'll mock some partial data for employees.
    if (userData.role === 'employee' && !userData.profile) {
      userData.profile = {
          name: userData.isNew ? 'New Employee' : 'Alex Doe',
          department: 'Technology',
          status: 'Active'
      };
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = { user, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
