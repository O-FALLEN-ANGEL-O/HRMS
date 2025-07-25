
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { mockUsers, type User, type UserProfile } from '@/lib/mock-data/employees';

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
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    const { email, password, firstName, lastName } = data;

    // Check if user already exists in our mock data
    if (mockUsers.some(u => u.email === email)) {
        setLoading(false);
        return { error: { message: "An account with this email already exists." } };
    }
    
    const newProfile: UserProfile = {
        id: `profile-${Date.now()}`,
        full_name: `${firstName} ${lastName}`,
        department: { name: "Engineering" },
        department_id: "d-001",
        job_title: 'New Hire',
        role: 'employee', // Default role for new signups
        employee_id: `PEP${String(mockUsers.length + 1).padStart(4,'0')}`,
        profile_picture_url: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
        phone_number: '123-456-7890',
        status: 'Active',
    };
    
    const newUser: User = {
        id: `user-${Date.now()}`,
        email: email,
        role: newProfile.role,
        profile: newProfile
    };
    
    // Add to our mock "database"
    mockUsers.push(newUser);
    
    // Log the user in
    setUser(newUser);
    sessionStorage.setItem('authUser', JSON.stringify(newUser));
    router.push(`/${newUser.role}/dashboard`);
    setLoading(false);
    return { error: null };
  }

  const logout = async () => {
    setUser(null);
    setSearchTerm('');
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
