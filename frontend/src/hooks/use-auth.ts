import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/config/supabase';
import type { User } from '@/types/database';

export const useAuth = () => {
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    // Get current session
    const checkUser = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: session.user.created_at,
          updated_at: new Date().toISOString(), // Fallback
        } as User);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          } as User);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setIsLoading]);
};
