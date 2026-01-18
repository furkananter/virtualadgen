import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabaseProjectRef = (() => {
  try {
    return new URL(supabaseUrl || '').hostname.split('.')[0];
  } catch {
    return null;
  }
})();

export const SUPABASE_AUTH_STORAGE_KEY = supabaseProjectRef
  ? `sb-${supabaseProjectRef}-auth-token`
  : 'sb-auth-token';

// Throw if env vars missing to fail fast
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    storageKey: SUPABASE_AUTH_STORAGE_KEY,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
