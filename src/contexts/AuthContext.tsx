import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import { useProfile } from '../hooks/useProfile';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  subscriptionTier: 'free' | 'premium';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
    // Clear sessionStorage cache on sign out
    sessionStorage.removeItem('banalist_profile_cache');
  };

  // Provide optimistic default profile while loading
  const profile: UserProfile | null = profileData || (user ? {
    id: user.id,
    email: user.email || '',
    role: 'user',
    subscriptionTier: 'free',
  } : null);

  const loading = authLoading || (user && profileLoading);

  const value = {
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
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
