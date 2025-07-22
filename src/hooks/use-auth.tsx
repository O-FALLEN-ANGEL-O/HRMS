
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getEmailForEmployeeId } from '@/app/actions';

export interface UserProfile {
  id: string;
  full_name: string;
  department: { name: string };
  department_id: string;
  job_title: string;
  role: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter' | 'qa-analyst' | 'process-manager' | 'team-leader' | 'marketing' | 'finance' | 'it-manager' | 'operations-manager';
  employee_id: string;
  profile_picture_url?: string;
  phone_number?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserProfile['role'];
  profile: UserProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  login: (employeeId: string, password: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  signUp: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock user for deployment build purposes
const MOCK_USER: User = {
    id: 'mock-user-id',
    email: 'admin@optitalent.com',
    role: 'admin',
    profile: {
        id: 'mock-user-id',
        full_name: 'Admin User',
        department: { name: 'Administration' },
        department_id: 'mock-dept-id',
        job_title: 'Administrator',
        role: 'admin',
        employee_id: 'PEP0001',
        phone_number: '1234567890'
    }
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    // If Supabase is not configured (e.g., in Vercel build), use a mock user and skip auth logic.
    if (!supabase || !supabase.auth) {
        setUser(MOCK_USER);
        setLoading(false);
        return;
    }

    const fetchUserAndProfile = async (sessionUser: SupabaseUser | null) => {
      if (sessionUser) {
        const { data: profile, error } = await supabase
            .from('employees')
            .select(`*, department:departments(name)`)
            .eq('id', sessionUser.id)
            .single();
        
        if (error) {
          console.error("Error fetching profile, logging out.", error);
          await supabase.auth.signOut();
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
    }
    
    // Run on initial load
    supabase.auth.getSession().then(({ data: { session }}) => {
      fetchUserAndProfile(session?.user ?? null);
    });

    // Set up the listener for auth changes
    const { data: { subscription }} = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        await fetchUserAndProfile(session?.user ?? null);
        if (event === "SIGNED_IN" && session?.user) {
          // The user object might not be set yet, so we get role from profile
          const { data: profile } = await supabase.from('employees').select('role').eq('id', session.user.id).single();
          const role = profile?.role || 'employee';
          router.push(`/${role}/dashboard`);
        } else if (event === "SIGNED_OUT") {
          router.push('/');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };

  }, [router]);
  
  const login = async (employeeId: string, password: string) => {
    if (!supabase) return { error: { message: "Supabase not configured." }};

    const { email } = await getEmailForEmployeeId(employeeId);

    if(!email) {
      return { error: { message: "Invalid Employee ID" }};
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };
  
  const signUp = async (data: any) => {
    if (!supabase) return { error: { message: "Supabase not configured." }};
    const { email, password, firstName, lastName } = data;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'employee',
          full_name: `${firstName} ${lastName}`
        }
      }
    });

    if (authError) return { user: null, error: authError };
    if (!authData.user) throw new Error("Sign up successful, but no user data returned.");

    // Generate a simple employee_id
    const employee_id = `PEP${String(Math.floor(Math.random() * 9000) + 1000).padStart(4,'0')}`;
    
    const { error: profileError } = await supabase
      .from('employees')
      .insert({
        id: authData.user.id,
        full_name: `${firstName} ${lastName}`,
        email: email,
        job_title: 'New Hire',
        employee_id,
        status: 'Active',
        role: 'employee',
        department_id: null,
        emergency_contact: JSON.stringify({}),
        skills: JSON.stringify([]),
        phone_number: '',
        profile_picture_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random&color=fff&size=400`
      });

    if (profileError) {
        console.error("Error creating profile:", profileError);
        return { user: null, error: profileError };
    }

    return { user: authData.user, error: null };
  }

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
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
