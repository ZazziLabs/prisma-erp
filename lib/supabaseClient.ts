import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adiciona uma função auxiliar para definir o token de autenticação globalmente.
// Esta é a forma correta de injetar o token do Firebase.
export const setSupabaseAuth = (token: string | null) => {
  if (token) {
    supabase.global.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete supabase.global.headers['Authorization'];
  }
};
