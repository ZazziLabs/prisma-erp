import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init) => {
      // Se um token JWT foi definido, ele será adicionado automaticamente ao cabeçalho Authorization
      return fetch(input, init);
    },
  },
});

// Adiciona um método para definir o token de autenticação
supabase.auth.setAuth = (token: string | null) => {
  if (token) {
    supabase.global.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete supabase.global.headers['Authorization'];
  }
};
