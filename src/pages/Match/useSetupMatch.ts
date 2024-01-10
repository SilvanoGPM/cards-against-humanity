import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  addUserToMatch,
  convertMatch,
  createNewActiveRoundToMatch,
  getMatch,
  streamMatch,
} from '@/services/matches';

import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { useToast } from '@chakra-ui/react';

export function useSetupMatch(id = '') {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [isLoading, startLoading, stopLoading] = useBoolean(true);
  const [loadingNext, startLoadingNext, stopLoadingNext] = useBoolean(false);
  const [isFirstTime, setTrueFirstTime, setFalseFirstTime] = useBoolean(false);

  const [match, setMatch] = useState<MatchConvertedType | null>(null);
  const [hasNewMessages, setHasNewMessases] = useState(false);

  const reload = useCallback(() => {
    startLoading();
  }, [startLoading]);

  useEffect(() => {
    async function fetchMatch(): Promise<void> {
      try {
        const match = await getMatch(id);

        const matchFinished = match?.status === 'FINISHED';

        if (!match || Object.keys(match).length === 0 || matchFinished) {
          navigate('/');

          const message = !match
            ? {
                title: 'Partida não encontrada',
                description: 'Não encontramos uma partida com esse código.',
              }
            : {
                title: 'Partida finalizada',
                description: 'Esta partida já foi finalizada',
              };

          toast({
            ...message,
            status: 'info',
          });

          return;
        }

        const userIsInTheMatch = match.users.find(
          (innerUser) => innerUser.id === user?.uid
        );

        if (!userIsInTheMatch) {
          await addUserToMatch(id, user.uid);
          setTrueFirstTime();
        }

        const convertedMatch = await convertMatch(match);

        setMatch(convertedMatch);
      } catch (error) {
        console.log('errror', error);

        toast({
          title: 'Partida não encontrada',
          description: 'Não encontramos uma partida com esse código.',
          status: 'info',
        });

        navigate('/');
      } finally {
        stopLoading();
      }
    }

    if (isLoading && user?.uid) {
      fetchMatch();
    }

    const unsubscribePromise = streamMatch(id, async (newMatch) => {
      if (newMatch.exists()) {
        const convertedMatch = await convertMatch({
          ...newMatch.data(),
          id: newMatch.id,
        });

        if (convertedMatch.status === 'FINISHED') {
          reload();
        }

        const hasDeck = convertedMatch?.actualRound?.decks.find(
          (deck) => deck.user.uid === user.uid
        );

        if (hasDeck && isFirstTime) {
          setFalseFirstTime();
        }

        setMatch((match) => {
          if (
            (match?.messages?.length || 0) !==
            (convertedMatch?.messages?.length || 0)
          ) {
            setHasNewMessases(true);
          }

          return convertedMatch;
        });

        stopLoading();
      }
    });

    return () => {
      stopLoading();
      unsubscribePromise.then((unsbscribe) => unsbscribe());
    };
  }, [
    toast,
    id,
    stopLoading,
    isLoading,
    navigate,
    user,
    reload,
    setTrueFirstTime,
    setFalseFirstTime,
    isFirstTime,
  ]);

  const nextRound = useCallback(async () => {
    try {
      startLoadingNext();

      setMatch((match) => {
        if (match?.actualRound) {
          return {
            ...match,
            actualRound: { ...match.actualRound, answers: [] },
          };
        }

        return match;
      });

      await createNewActiveRoundToMatch(id);
    } catch (error) {
      console.error('error', error);

      toast({
        title: 'Aconteceu um erro',
        description: 'Não foi possível carregar a rodada, recarregue a página.',
        status: 'warning',
      });
    } finally {
      stopLoadingNext();
    }
  }, [id, startLoadingNext, stopLoadingNext, toast]);

  return {
    isLoading,
    isFirstTime,
    loadingNext: loadingNext || match?.status === 'LOADING',
    match,
    reload,
    nextRound,
    hasNewMessages,
    setHasNewMessases,
  };
}
