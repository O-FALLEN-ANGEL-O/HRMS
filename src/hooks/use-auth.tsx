
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Keep the existing profile type
interface UserProfile {
  id: string;
  full_name: string;
  department: string;
  role: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter' | 'qa-analyst' | 'process-manager' | 'team-leader' | 'marketing' | 'finance' | 'it-manager' | 'operations-manager';
  employee_id: string;
}

interface User {
  id: string;
  email: string;
  role: UserProfile['role'];
  profile: UserProfile | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  login: (identifier: string, password: string, isEmployeeId?: boolean) => Promise<any>;
  logout: () => Promise<any>;
  signUp: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async (sessionUser: SupabaseUser | null) => {
        if (sessionUser) {
            const { data: profile, error } = await supabase
                .from('employees')
                .select('*')
                .eq('id', sessionUser.id)
                .single();

            if (error) {
                console.error("Error fetching profile:", error);
                setUser(null);
            } else {
                 setUser({
                    id: sessionUser.id,
                    email: sessionUser.email!,
                    role: profile.role,
                    profile: profile
                });
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    };
    
    // Fetch user on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
        fetchUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        fetchUser(session?.user ?? null);
        if (event === 'SIGNED_IN') {
           const { data: profile } = await supabase
                .from('employees')
                .select('role')
                .eq('id', session?.user.id)
                .single();
            if (profile) {
                 router.push(`/${profile.role}/dashboard`);
            } else {
                 router.push(`/employee/dashboard`);
            }
        }
        if (event === 'SIGNED_OUT') {
            router.push('/');
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const login = async (identifier: string, password: string, isEmployeeId: boolean = false) => {
    let email = identifier;
    if (isEmployeeId) {
      if (!identifier) {
        return { data: null, error: { message: "Employee ID is required." } };
      }
      const { data: employee, error } = await supabase
        .from('employees')
        .select('email')
        .eq('employee_id', identifier.toUpperCase())
        .single();
      
      if (error || !employee) {
        return { data: null, error: { message: "Employee ID not found." } };
      }
      email = employee.email;
    }
    return supabase.auth.signInWithPassword({ email, password });
  };
  
  const signUp = async (data: any) => {
    const { email, password, firstName, lastName } = data;
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) return { user: null, error: authError };
    if (!authData.user) throw new Error("Sign up successful, but no user data returned.");

    // Generate a simple employee_id
    const employee_id = `PEP${String(Math.floor(Math.random() * 900) + 100).padStart(4,'0')}`;

    const { error: profileError } = await supabase
      .from('employees')
      .insert({
        id: authData.user.id,
        full_name: `${firstName} ${lastName}`,
        email: email,
        role: 'employee', // All new signups are employees
        employee_id,
      });

    if (profileError) {
        console.error("Error creating profile:", profileError);
        return { user: authData.user, error: profileError };
    }

    return { user: authData.user, error: null };
  }

  const logout = async () => {
    return supabase.auth.signOut();
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
