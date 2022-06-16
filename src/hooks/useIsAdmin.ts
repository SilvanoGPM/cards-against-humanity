import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/services/users';
import { useEffect, useState } from 'react';

export function useIsAdmin(): boolean {
  const { user } = useAuth();

  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    async function verifyIsAdmin(): Promise<void> {
      const userIsAdmin = await isAdmin(user.uid);

      setUserIsAdmin(userIsAdmin);
    }

    verifyIsAdmin();
  }, [user]);

  return userIsAdmin;
}
