import { useState, useEffect, useCallback } from 'react';
import auth from '@/lib/shared/kliv-auth.js';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const u = await auth.getUser();
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signIn = async (email: string, password: string) => {
    const u = await auth.signIn(email, password);
    setUser(u);
    return u;
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  const hasGroup = (key: string) => auth.hasGroup(key);

  return { user, loading, signIn, signOut, hasGroup, refresh };
}
