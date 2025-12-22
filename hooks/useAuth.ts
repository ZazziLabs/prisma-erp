import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { setSupabaseAuth } from '../lib/supabaseClient';

// Este hook é o ponto central que gerencia o estado de autenticação do usuário.
// Ele utiliza exclusivamente o Firebase Auth como provedor de identidade.
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitora as mudanças de estado de autenticação do Firebase.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Se o usuário estiver logado no Firebase, obtém o token JWT dele.
        const token = await user.getIdToken();
        // Em seguida, configura o cliente Supabase para usar esse token em todas as requisições ao banco de dados.
        // Isso "autentica" o Supabase usando a sessão do Firebase.
        setSupabaseAuth(token);
      } else {
        // Se o usuário fizer logout no Firebase, remove o token do cliente Supabase.
        setSupabaseAuth(null);
      }
      setLoading(false);
    });

    // Função de limpeza que é executada quando o componente é desmontado.
    return () => {
      unsubscribe();
      // Garante que o token seja limpo ao sair.
      setSupabaseAuth(null);
    }
  }, []);

  return { user, loading };
};
