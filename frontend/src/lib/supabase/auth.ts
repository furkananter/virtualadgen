import { supabase, SUPABASE_AUTH_STORAGE_KEY } from '@/config/supabase';
import type { Session } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/auth-store';

const getAuthStorageKeys = (): string[] => [
    SUPABASE_AUTH_STORAGE_KEY,
    `${SUPABASE_AUTH_STORAGE_KEY}-code-verifier`,
];

/**
 * Get the current session.
 */
export const getSession = async (): Promise<Session | null> => {
    const {
        data: { session },
    } = await supabase.auth.getSession();
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

/**
 * Sign out and clear all local state.
 */
export const logout = async (): Promise<void> => {
    // Always attempt signOut, but don't block cleanup on failure
    try {
        await supabase.auth.signOut();
    } catch {
        // Silently continue - we still clear local state
    }

    // Always clear local state, regardless of signOut result
    for (const key of getAuthStorageKeys()) {
        localStorage.removeItem(key);
    }

    useAuthStore.getState().clearUser();
    window.location.href = '/login';
};
