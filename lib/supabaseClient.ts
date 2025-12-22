import { createClient } from '@supabase/supabase-js';

// Este arquivo configura o cliente Supabase.
// O Supabase é utilizado apenas para o banco de dados. A autenticação de usuários
// é responsabilidade exclusiva do Firebase.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cria o cliente Supabase de forma segura, usando a chave anônima (anon key).
// O token de autenticação do usuário será adicionado dinamicamente.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Esta função atualiza o cliente Supabase com o token de autenticação (JWT)
// gerado pelo Firebase. Isso permite que as requisições ao banco de dados
// sejam feitas em nome do usuário logado no Firebase.
export const setSupabaseAuth = (token: string | null) => {
  // A biblioteca do Supabase gerencia um único cabeçalho de autorização.
  // Se o token for nulo (logout), ele é removido.
  // Se um novo token for fornecido (login), ele substitui o antigo.
  if (token) {
    (supabase.auth as any)._setAuth(token);
  } else {
    (supabase.auth as any)._setAuth(null);
  }
};
