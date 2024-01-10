import { useEffect, useState } from 'react';

import { convertMatch, getLastMatches } from '@/services/matches';

import { useBoolean } from '@/hooks/useBoolean';
import { useToast } from '@chakra-ui/react';

interface UseLastMatchesReturn {
  matches: MatchConvertedType[];
  setMatches: (matches: MatchConvertedType[]) => void;
  loading: boolean;
}

export function useLastMatches(size = 10): UseLastMatchesReturn {
  const [loading, , stopLoading] = useBoolean(true);
  const [matches, setMatches] = useState<MatchConvertedType[]>([]);
  const toast = useToast();

  useEffect(() => {
    async function loadMatches(): Promise<void> {
      try {
        const matches = await getLastMatches(size);

        const convertedMatches = await Promise.all(matches.map(convertMatch));

        setMatches(convertedMatches);
      } catch (error) {
        console.error('error', error);

        toast({
          title: 'Aconteceu um erro',
          description: 'Não foi possível encontrar as últimas partidas.',
          variant: 'error',
        });
      } finally {
        stopLoading();
      }
    }

    if (loading) {
      loadMatches();
    }

    return () => stopLoading();
  }, [size, loading, stopLoading, toast]);

  // TODO: Ativiar o stream novamente

  // useEffect(() => {
  //   const unsubscribePromise = streamMatches(async (snapshot) => {
  //     const newMatchesPromises = snapshot
  //       .docChanges()
  //       .filter(({ type }) => type === 'added')
  //       .map(({ doc }) => convertMatch(toValue(doc)));

  //     const newMatches = await Promise.all(newMatchesPromises);

  //     const removedMatches = snapshot
  //       .docChanges()
  //       .filter(({ type }) => type === 'removed')
  //       .map(({ doc }) => toValue(doc).id);

  //     if (newMatches.length !== 0 || removedMatches.length !== 0) {
  //       setMatches((matches) => {
  //         const matchesId = matches.map(({ id }) => id);

  //         return [
  //           ...newMatches.filter(({ id }) => !matchesId.includes(id)),
  //           ...matches.filter(({ id }) => !removedMatches.includes(id)),
  //         ];
  //       });
  //     }
  //   });

  //   return () => {
  //     unsubscribePromise.then((unsbscribe) => unsbscribe());
  //   };
  // }, [isFirstStream, setFalseFirstStream]);

  return { matches, setMatches, loading };
}
