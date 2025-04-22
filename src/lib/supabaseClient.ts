
import { createClient } from '@supabase/supabase-js';

// These variables are automatically injected by Lovable when connected to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error('Missing Supabase credentials. Please make sure you have connected your project to Supabase by clicking the green Supabase button in the top right.');
}

// Create a mock client if not configured to prevent runtime errors
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any;
