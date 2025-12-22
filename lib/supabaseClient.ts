import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente são carregadas pelo Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Valida se as variáveis de ambiente foram configuradas
export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Cria a instância do cliente Supabase.
// O tipo é definido como 'any' para permitir a manipulação direta dos cabeçalhos,
// uma prática necessária para integrar com autenticação JWT de terceiros como o Firebase.
export const supabase: any = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Define o token de autenticação JWT do Firebase para as requisições do Supabase.
 * Isso garante que as políticas de segurança (RLS) do Supabase funcionem com
 * a autenticação do Firebase.
 * @param token - O token JWT do usuário logado no Firebase, ou null para limpar.
 */
export const setSupabaseAuth = (token: string | null) => {
  if (token) {
    // Adiciona o token ao cabeçalho de autorização para todas as futuras requisições
    supabase.global.headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Remove o token se o usuário fizer logout
    delete supabase.global.headers['Authorization'];
  }
};
