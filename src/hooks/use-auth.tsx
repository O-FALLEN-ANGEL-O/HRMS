
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['employees']['Row'] & {
  role: Database['public']['Tables']['users']['Row']['role'];
};

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  login: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  logout: () => Promise<void>;
  signUp: (data: any) => Promise<{ error: { message: string } | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('employees')
          .select('*, users!inner(role)')
          .eq('user_id', session.user.id)
          .single();

        if (userProfile) {
            const enrichedProfile = {
                ...userProfile,
                role: userProfile.users.role,
            };
            // @ts-ignore
            delete enrichedProfile.users;
            setProfile(enrichedProfile as UserProfile);
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
       if (!session?.user) {
        setProfile(null);
        router.push('/');
      }
      // You might want to re-fetch the profile here as well
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      return { error: { message: error.message } };
    }

    // Fetch profile after successful sign-in
    const { data: user, error: userError } = await supabase.auth.getUser();
    if(user.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('employees')
          .select('*, users!inner(role)')
          .eq('user_id', user.user.id)
          .single();

        if (profileError) {
             setLoading(false);
             return { error: { message: "Could not find user profile." } };
        }
        
        if (userProfile) {
            const enrichedProfile = {
                ...userProfile,
                role: userProfile.users.role,
            };
            // @ts-ignore
            delete enrichedProfile.users;
            setProfile(enrichedProfile as UserProfile);
            router.push(`/${enrichedProfile.role}/dashboard`);
        }
    } else {
         setLoading(false);
         return { error: { message: "Could not retrieve user after login." } };
    }
    
    setLoading(false);
    return { error: null };
  };
  
  const signUp = async (data: any) => {
    setLoading(true);
    const { email, password, firstName, lastName } = data;
    
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
        },
      },
    });

    if (error) {
        setLoading(false);
        return { error: { message: error.message } };
    }
    
    // The trigger will handle profile creation.
    // We can then navigate them to a "check your email" page or directly log them in
    // if email confirmation is disabled. For now, let's just log them in.
    if(signUpData.user) {
        // Since we are using a trigger, we might need to wait a bit for the profile to be created
        // A better approach would be to navigate to a waiting page or handle it more gracefully.
        await new Promise(resolve => setTimeout(resolve, 1000));
        await login(email, password);
    }
    
    setLoading(false);
    return { error: null };
  }

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSearchTerm('');
    router.push('/');
  };

  const value = { user, profile, loading, searchTerm, setSearchTerm, login, logout, signUp };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
