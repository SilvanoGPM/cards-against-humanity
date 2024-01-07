import { finishMatch } from '@/services/matches';
import { useEffect } from 'react';

export function useDisableMatch(
  id: string | undefined,
  isOwner: boolean
): void {
  useEffect(() => {
    async function changeMatchStatus(): Promise<void> {
      console.log('aquii');

      if (isOwner && id) {
        finishMatch(id);
      }
    }

    window.addEventListener('beforeunload', changeMatchStatus);

    return () => {
      window.removeEventListener('beforeunload', changeMatchStatus);
    };
  }, [id, isOwner]);
}
