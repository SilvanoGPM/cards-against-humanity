import { isAdmin } from '@/services/users';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export function useIsAdmin(user: User, shouldFetch: boolean): boolean {
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    async function verifyIsAdmin(): Promise<void> {
      const userIsAdmin = await isAdmin(user.uid);

      setUserIsAdmin(userIsAdmin);
    }

    if (user?.uid && shouldFetch) {
      verifyIsAdmin();
    }
  }, [user, shouldFetch]);

  return userIsAdmin;
}
