import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

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

// Profile cache (in-memory)
const profileCache = new Map<string, UserProfile>();

// SessionStorage key for persistent cache
const PROFILE_CACHE_KEY = 'banalist_profile_cache';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Prevent multiple executions in StrictMode
    if (isInitialized) return;

    console.log('[AuthContext] useEffect starting...');
    setIsInitialized(true);

    const fetchProfile = async (userId: string): Promise<UserProfile> => {
      console.log('[AuthContext] fetchProfile called for userId:', userId);

      // Check in-memory cache first
      const cached = profileCache.get(userId);
      if (cached) {
        console.log('[AuthContext] Using in-memory cached profile:', cached);
        return cached;
      }

      // Check sessionStorage cache
      try {
        const sessionCached = sessionStorage.getItem(PROFILE_CACHE_KEY);
        if (sessionCached) {
          const parsedCache = JSON.parse(sessionCached);
          if (parsedCache.userId === userId) {
            console.log('[AuthContext] Using sessionStorage cached profile:', parsedCache.profile);
            profileCache.set(userId, parsedCache.profile);
            return parsedCache.profile;
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error reading sessionStorage cache:', err);
      }

      // Timeout for slow Supabase queries (reduced to 10 seconds)
      const timeoutPromise = new Promise<UserProfile>((resolve) => {
        setTimeout(() => {
          console.warn('[AuthContext] Profile fetch timed out after 10 seconds, using defaults');
          resolve({
            id: userId,
            email: '',
            role: 'user',
            subscriptionTier: 'free',
          });
        }, 10000); // 10 second timeout
      });

      const fetchPromise = (async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, email, role, subscription_tier')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('[AuthContext] Error fetching profile:', error);
            // Return default profile if fetch fails
            return {
              id: userId,
              email: '',
              role: 'user',
              subscriptionTier: 'free',
            };
          }

          console.log('[AuthContext] Profile fetched successfully:', data);
          const userProfile = {
            id: data.id,
            email: data.email || '',
            role: (data.role || 'user') as 'admin' | 'user',
            subscriptionTier: (data.subscription_tier || 'free') as 'free' | 'premium',
          };

          // Cache the profile (both in-memory and sessionStorage)
          profileCache.set(userId, userProfile);
          try {
            sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
              userId,
              profile: userProfile,
              timestamp: Date.now(),
            }));
          } catch (err) {
            console.error('[AuthContext] Error saving to sessionStorage:', err);
          }

          return userProfile;
        } catch (err) {
          console.error('[AuthContext] Exception fetching profile:', err);
          return {
            id: userId,
            email: '',
            role: 'user',
            subscriptionTier: 'free',
          };
        }
      })();

      // Race between fetch and timeout
      return Promise.race([fetchPromise, timeoutPromise]);
    };

    // Get initial session
    console.log('[AuthContext] Getting initial session...');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[AuthContext] Got session:', session);
      setSession(session);
      setUser(session?.user ?? null);

      // Set loading to false immediately to show UI
      setLoading(false);

      if (session?.user) {
        console.log('[AuthContext] User found, fetching profile in background...');
        // Fetch profile in background (non-blocking)
        fetchProfile(session.user.id).then((userProfile) => {
          console.log('[AuthContext] Setting profile:', userProfile);
          setProfile(userProfile);
        });
      }
    }).catch((error) => {
      console.error('[AuthContext] Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isInitialized]);

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
  };

  const value = {
    user,
    session,
    // Provide optimistic default profile if still loading
    profile: profile || (user ? {
      id: user.id,
      email: user.email || '',
      role: 'user' as const,
      subscriptionTier: 'free' as const,
    } : null),
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
