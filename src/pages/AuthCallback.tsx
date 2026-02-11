import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirect, { replace: true });
      } else {
        navigate('/auth?error=callback_failed', { replace: true });
      }
    });
  }, [navigate, redirect]);

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
};
