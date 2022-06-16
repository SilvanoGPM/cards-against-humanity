import { useEffect, useState } from 'react';

import { getLastMatches, streamMatches } from '@/services/matches';
import { AppToaster } from '@/components/Toast';
import { useBoolean } from '@/hooks/useBoolean';
import { toValue } from '@/services/core';

interface UseLastMatchesReturn {
  matches: MatchType[];
  loading: boolean;
}

export function useLastMatches(size = 10): UseLastMatchesReturn {
  const [loading, , stopLoading] = useBoolean(true);
  const [isFirstStream, setFalseFirstStream] = useBoolean(true);
  const [matches, setMatches] = useState<MatchType[]>([]);

  useEffect(() => {
    async function loadMatches(): Promise<void> {
      try {
        const matches = await getLastMatches(size);
        setMatches(matches);
      } catch {
        AppToaster.show({
          message: 'Aconteceu um erro ao tentar encontrar as últimas partidas',
        });
      } finally {
        stopLoading();
      }
    }

    loadMatches();

    return () => stopLoading();
  }, [size, stopLoading]);

  useEffect(() => {
    const unsubscribePromise = streamMatches(async (snapshot) => {
      const newMatches = snapshot
        .docChanges()
        .filter(({ type }) => type === 'added')
        .map(({ doc }) => toValue(doc));

      // workaround for inital stream.
      if (newMatches.length > 10) {
        return;
      }

      const removedMatches = snapshot
        .docChanges()
        .filter(({ type }) => type === 'removed')
        .map(({ doc }) => toValue(doc).id);

      if (newMatches.length !== 0 || removedMatches.length !== 0) {
        setMatches((matches) => [
          ...newMatches,
          ...matches.filter(({ id }) => !removedMatches.includes(id)),
        ]);
      }
    });

    return () => {
      unsubscribePromise.then((unsbscribe) => unsbscribe());
    };
  }, [isFirstStream, setFalseFirstStream]);

  return { matches, loading };
}
