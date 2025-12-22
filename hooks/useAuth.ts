import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { setSupabaseAuth } from '../lib/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        setSupabaseAuth(token);
      } else {
        setSupabaseAuth(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setSupabaseAuth(null);
    }
  }, []);

  return { user, loading };
};
