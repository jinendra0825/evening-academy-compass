
import { createClient } from '@supabase/supabase-js';

// These variables are automatically injected by Lovable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure you have connected your project to Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
