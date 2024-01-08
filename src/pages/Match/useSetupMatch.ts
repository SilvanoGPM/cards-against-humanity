import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  addUserToMatch,
  convertMatch,
  createNewActiveRoundToMatch,
  getMatch,
  streamMatch,
} from '@/services/matches';

import { AppToaster } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';

interface UseFetchMatchReturn {
  match: MatchConvertedType;
  isLoading: boolean;
  isFirstTime: boolean;
  loadingNext: boolean;
  reload: () => void;
  nextRound: () => void;
}

export function useSetupMatch(id: string): UseFetchMatchReturn {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, startLoading, stopLoading] = useBoolean(true);
  const [loadingNext, startLoadingNext, stopLoadingNext] = useBoolean(false);
  const [isFirstTime, setTrueFirstTime, setFalseFirstTime] = useBoolean(false);

  const [match, setMatch] = useState<MatchConvertedType>(
    {} as MatchConvertedType
  );

  const reload = useCallback(() => {
    startLoading();
  }, [startLoading]);

  useEffect(() => {
    async function fetchMatch(): Promise<void> {
      try {
        const match = await getMatch(id);

        const matchFinished = match?.status === 'FINISHED';

        if (!match || matchFinished) {
          navigate('/');

          const message = !match
            ? 'Partida não encontrada!'
            : 'Partida finalizada!';

          AppToaster.show({ intent: 'primary', message });

          return;
        }

        const userIsInTheMatch = match.users.find(
          (innerUser) => innerUser.id === user.uid
        );

        if (!userIsInTheMatch) {
          await addUserToMatch(id, user.uid);
          setTrueFirstTime();
        }

        const convertedMatch = await convertMatch(match);

        setMatch(convertedMatch);
      } catch {
        AppToaster.show({
          intent: 'primary',
          message: 'Partida não encontrada!',
        });

        navigate('/');
      } finally {
        stopLoading();
      }
    }

    if (isLoading) {
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

        setMatch(convertedMatch);
      }
    });

    return () => {
      stopLoading();
      unsubscribePromise.then((unsbscribe) => unsbscribe());
    };
  }, [
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
      await createNewActiveRoundToMatch(id);
    } catch {
      AppToaster.show({
        intent: 'danger',
        icon: 'error',
        message: 'Aconteceu um erro ao tentar carregar a próxima rodada',
      });
    } finally {
      stopLoadingNext();
    }
  }, [id, startLoadingNext, stopLoadingNext]);

  return {
    isLoading,
    isFirstTime,
    loadingNext,
    match,
    reload,
    nextRound,
  };
}
