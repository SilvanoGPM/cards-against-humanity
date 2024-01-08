import { finishMatch } from '@/services/matches';
import { useEffect } from 'react';

export function useDisableMatch(
  id: string | undefined,
  isOwner: boolean
): void {
  useEffect(() => {
    let called = false;

    async function changeMatchStatus(): Promise<void> {
      if (isOwner && id && !called) {
        finishMatch(id);
        called = true;
      }
    }

    window.addEventListener('beforeunload', changeMatchStatus);
    window.addEventListener('unload', changeMatchStatus);

    return () => {
      window.removeEventListener('beforeunload', changeMatchStatus);
      window.removeEventListener('unload', changeMatchStatus);
    };
  }, [id, isOwner]);
}
