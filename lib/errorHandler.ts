import { toast } from '../hooks/use-toast';

interface SupabaseError {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
}

// Mapeia códigos de erro comuns do Supabase para mensagens amigáveis.
const userFriendlyMessages: Record<string, string> = {
  // Network Errors
  'FETCH_ERROR': 'Falha na conexão. Verifique sua internet e tente novamente.',
  
  // Auth Errors
  '401': 'Acesso não autorizado. Por favor, faça login novamente.',
  'INVALID_JWT': 'Sua sessão expirou. Por favor, faça login novamente.',

  // RLS (Row Level Security) Errors
  '42501': 'Você não tem permissão para realizar esta ação.',
  
  // Postgres Errors
  '23505': 'Já existe um registro com estes dados. Por favor, verifique os campos únicos.',
  'PGRST116': 'O registro que você está tentando acessar não foi encontrado.',
};

/**
 * Manipulador de erros centralizado.
 * @param error O objeto de erro capturado.
 * @param customMessage Mensagem customizada para exibir ao usuário.
 */
export const handleError = (error: any, customMessage?: string): never => {
  // 1. Loga o erro completo no console para debugging.
  console.error("API Error:", error);

  let message = customMessage || 'Ocorreu um erro inesperado. Tente novamente mais tarde.';

  // 2. Tenta encontrar uma mensagem amigável baseada no código do erro.
  if (error && (error.code || error.message)) {
    const code = error.code?.toString();
    // Prioriza o código de erro, mas também verifica a mensagem
    if (code && userFriendlyMessages[code]) {
      message = userFriendlyMessages[code];
    } else if (userFriendlyMessages[error.message]) {
        message = userFriendlyMessages[error.message];
    }
  }

  // 3. Exibe a notificação (toast) para o usuário.
  toast({
    title: 'Algo deu errado!',
    description: message,
    variant: 'destructive',
  });

  // Lança o erro para que possa ser capturado em try/catch
  throw error;
};
