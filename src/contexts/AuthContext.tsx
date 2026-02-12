import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { useProfile } from '../hooks/useProfile';

interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  subscriptionTier: 'free' | 'premium';
  subscriptionExpiresAt?: string;
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'canceling' | 'canceled' | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Use React Query for profile fetching
  const { data: profileData, isLoading: profileLoading } = useProfile(user?.id);

  useEffect(() => {
    // Get initial session
    console.log('[AuthContext] Getting initial session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Got session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    }).catch((error) => {
      console.error('[AuthContext] Error getting session:', error);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const oauthRedirectTo = `${window.location.origin}/auth/callback`;

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: oauthRedirectTo,
      },
    });
    if (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: oauthRedirectTo,
      },
    });
    if (error) {
      console.error('Error signing in with Apple:', error.message);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: oauthRedirectTo,
      },
    });
    return {
      error: error?.message || null,
      needsConfirmation: !error && !data?.session,
    };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  };

  // Provide optimistic default profile while loading
  const profile: UserProfile | null = profileData || (user ? {
    id: user.id,
    email: user.email || '',
    fullName: undefined,
    avatarUrl: undefined,
    role: 'user',
    subscriptionTier: 'free',
  } : null);

  const loading = authLoading || (user ? profileLoading : false);

  const value = {
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
