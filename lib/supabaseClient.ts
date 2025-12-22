import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables in different environments (Vite, CRA, etc.)
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process?.env?.[key]) {
      // @ts-ignore
      return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta?.env?.[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (error) {
    // Ignore errors accessing env
  }
  return '';
};

const envUrl = getEnv('REACT_APP_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
const envKey = getEnv('REACT_APP_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

// Use environment variables or fallback to a placeholder to prevent app crash on initialization.
const supabaseUrl = envUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = envKey || 'placeholder';

export const isConfigured = !!envUrl && !!envKey;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
