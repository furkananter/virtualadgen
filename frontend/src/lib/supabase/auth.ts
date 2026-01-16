import { supabase } from '@/config/supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * Get the current session.
 */
export const getSession = async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

/**
 * Get current authenticated user ID.
 * @throws Error if not authenticated
 */
export const getCurrentUserId = async (): Promise<string> => {
    const session = await getSession();
    if (!session) throw new Error('Not authenticated');
    return session.user.id;
};
