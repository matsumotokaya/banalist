import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  subscriptionTier: 'free' | 'premium';
}

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

// Fetch profile from Supabase
async function fetchProfile(userId: string): Promise<UserProfile> {
  // Check sessionStorage cache first (v2 - added subscription tier support)
  const PROFILE_CACHE_KEY = 'banalist_profile_cache_v2';
  try {
    const sessionCached = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (sessionCached) {
      const parsedCache = JSON.parse(sessionCached);
      if (parsedCache.userId === userId) {
        console.log('[useProfile] Using sessionStorage cached profile:', parsedCache.profile);
        return parsedCache.profile;
      }
    }
  } catch (err) {
    console.error('[useProfile] Error reading sessionStorage cache:', err);
  }

  // Fetch from Supabase with timeout
  const timeoutPromise = new Promise<UserProfile>((resolve) => {
    setTimeout(() => {
      console.warn('[useProfile] Profile fetch timed out after 10 seconds');
      resolve({
        id: userId,
        email: '',
        role: 'user',
        subscriptionTier: 'free',
      });
    }, 10000);
  });

  const fetchPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, subscription_tier')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[useProfile] Error fetching profile:', error);
        return {
          id: userId,
          email: '',
          role: 'user' as const,
          subscriptionTier: 'free' as const,
        };
      }

      console.log('[useProfile] Profile fetched successfully:', data);
      const userProfile: UserProfile = {
        id: data.id,
        email: data.email || '',
        role: (data.role || 'user') as 'admin' | 'user',
        subscriptionTier: (data.subscription_tier || 'free') as 'free' | 'premium',
      };

      // Cache to sessionStorage
      try {
        sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
          userId,
          profile: userProfile,
          timestamp: Date.now(),
        }));
      } catch (err) {
        console.error('[useProfile] Error saving to sessionStorage:', err);
      }

      return userProfile;
    } catch (err) {
      console.error('[useProfile] Exception fetching profile:', err);
      return {
        id: userId,
        email: '',
        role: 'user' as const,
        subscriptionTier: 'free' as const,
      };
    }
  })();

  return Promise.race([fetchPromise, timeoutPromise]);
}

// Hook to get user profile
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId || ''),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - profiles change rarely
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    retry: 2,
  });
}
