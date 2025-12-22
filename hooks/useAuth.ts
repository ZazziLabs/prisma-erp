import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        supabase.auth.setAuth(token);
      } else {
        supabase.auth.setAuth(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      supabase.auth.setAuth(null);
    }
  }, []);

  return { user, loading };
};
