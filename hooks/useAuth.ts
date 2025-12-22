import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { setSupabaseAuth } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitora as mudanças de estado de autenticação do Firebase.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Se o usuário estiver logado, obtém o token do Firebase.
        const token = await user.getIdToken();
        // E configura o cliente Supabase para usar esse token.
        setSupabaseAuth(token);
      } else {
        // Se o usuário fizer logout, remove o token do cliente Supabase.
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
