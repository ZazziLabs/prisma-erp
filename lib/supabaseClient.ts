import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// A instância do Supabase é criada aqui.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Esta função atualiza o token de autenticação na instância global do Supabase.
// Ela é chamada pelo hook useAuth sempre que o estado de login do Firebase muda.
export const setSupabaseAuth = (token: string | null) => {
  if (token) {
    // Define o cabeçalho de autorização para todas as futuras requisições do Supabase.
    supabase.global.headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Se o token for nulo (logout), removemos o cabeçalho para voltar a ser um cliente anônimo.
    delete supabase.global.headers['Authorization'];
  }
};
