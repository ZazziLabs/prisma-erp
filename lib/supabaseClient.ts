import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cria o cliente Supabase de forma segura
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Função mantida para compatibilidade, mas simplificada já que usamos Supabase Auth agora
export const setSupabaseAuth = (token: string | null) => {
  // O Supabase Auth gerencia os tokens automaticamente. 
  // Esta função não é mais necessária para o funcionamento básico, 
  // mas vamos deixá-la aqui para não quebrar outros arquivos que a importam.
  console.log("Supabase Auth está gerenciando a sessão automaticamente.");
};
