
import { createClient } from '@supabase/supabase-js';

// Set up Supabase with direct values
const supabaseUrl = "https://obgazoojckeyylmzgjlo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ2F6b29qY2tleXlsbXpnamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDM5MDQsImV4cCI6MjA2MDkxOTkwNH0.T55X2ZR9WHF-SWpiKQhbFs8-JLm8DTDQDZI0huWVC0I";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
