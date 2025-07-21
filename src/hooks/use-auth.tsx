

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

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
  logout: () => Promise<any>;
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

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile, error } = await supabase
            .from('employees')
            .select(`*, department:departments(name)`)
            .eq('id', session.user.id)
            .single();

            if (!error && profile) {
                const userRole = profile?.role || (session.user.app_metadata.role as UserProfile['role']) || 'employee';
                setUser({
                  id: session.user.id,
                  email: session.user.email!,
                  role: userRole,
                  profile: profile as UserProfile,
                });
            }
        } else {
             // Check for our manual user profile cookie
            const userProfileCookie = document.cookie.split('; ').find(row => row.startsWith('user-profile='));
            if (userProfileCookie) {
                try {
                    const userData = JSON.parse(decodeURIComponent(userProfileCookie.split('=')[1]));
                    setUser(userData);
                } catch (e) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        }
        setLoading(false);
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        setLoading(true);
        if (event === 'SIGNED_IN' && session?.user) {
           const { data: profile } = await supabase.from('employees').select('*, department:departments(name)').eq('id', session.user.id).single();
            if(profile) {
              const userRole = profile?.role || 'employee';
              setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    role: userRole,
                    profile: profile as UserProfile,
              });
              router.push(`/${userRole}/dashboard`);
            }
        }
        if (event === 'SIGNED_OUT') {
            document.cookie = 'user-profile=; Max-Age=-99999999; path=/;';
            setUser(null);
            router.push('/');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);
  
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
    
    // Get a default department_id (e.g., 'Support')
    const { data: deptData } = await supabase.from('departments').select('id').eq('name', 'Support').single();


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
        department_id: deptData?.id || null, // Fallback to null if not found
        emergency_contact: JSON.stringify({}),
        skills: JSON.stringify([]),
        phone_number: '',
        profile_picture_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random&color=fff&size=400`
      });

    if (profileError) {
        console.error("Error creating profile:", profileError);
        // Attempt to delete the auth user if profile creation fails to prevent orphaned users
        // This requires service_role key and should be handled with care
        // await supabase.auth.admin.deleteUser(authData.user.id);
        return { user: null, error: profileError };
    }

    return { user: authData.user, error: null };
  }

  const logout = async () => {
    if (!supabase) return;
    document.cookie = 'user-profile=; Max-Age=-99999999; path=/;';
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const value = { user, loading, searchTerm, setSearchTerm, logout, signUp };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
