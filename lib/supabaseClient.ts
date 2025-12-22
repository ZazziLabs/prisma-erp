import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// A instância do Supabase é criada aqui.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Esta função atualiza o token de autenticação na instância global do Supabase.
export const setSupabaseAuth = (token: string | null) => {
  if (token) {
    supabase.global.headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Se o token for nulo (logout), removemos o cabeçalho.
    delete supabase.global.headers['Authorization'];
  }
};
