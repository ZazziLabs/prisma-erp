import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Este arquivo configura o cliente Supabase.
// O Supabase é utilizado apenas para o banco de dados. A autenticação de usuários
// é responsabilidade exclusiva do Firebase.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Variável para armazenar o token atual
let currentFirebaseToken: string | null = null;

// Cria o cliente Supabase com headers customizados
const createSupabaseClient = (token?: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    }
  });
};

// Cliente inicial sem token
export let supabase = createSupabaseClient();

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Esta função atualiza o cliente Supabase com o token de autenticação (JWT)
// gerado pelo Firebase. Isso permite que as requisições ao banco de dados
// sejam feitas em nome do usuário logado no Firebase.
export const setSupabaseAuth = (firebaseToken: string | null) => {
  currentFirebaseToken = firebaseToken;
  
  // Recria o cliente com o novo token
  supabase = createSupabaseClient(firebaseToken || undefined);
};
