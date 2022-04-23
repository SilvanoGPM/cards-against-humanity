import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBoolean } from '@/hooks/useBoolean';
import { getCards } from '@/services/cards';
import {
  addRoundToMatch,
  addUserToMatch,
  getMatch,
  streamMatch,
} from '@/services/matches';
import { useAuth } from '@/contexts/AuthContext';

interface UseFetchMatchReturn {
  match: MatchType;
  cards: CardType[];
  isLoading: boolean;
  nextRound: () => void;
}

export function useSetupMatch(id: string): UseFetchMatchReturn {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, , stopLoading] = useBoolean(true);

  const [match, setMatch] = useState<MatchType>({
    id: '',
    owner: '',
    rounds: [],
    status: 'PLAYING',
    users: [],
  });

  const [cards, setCards] = useState<CardType[]>([]);

  useEffect(() => {
    async function fetchMatch(): Promise<void> {
      try {
        const match = await getMatch(id);

        const hasMatchNotFinished =
          !match.status || match.status === 'FINISHED';

        if (hasMatchNotFinished) {
          navigate('/');
        }

        const cards = await getCards();

        const userIsInTheMatch = match.users.find(
          (innerUser) => innerUser === user.email
        );

        if (!userIsInTheMatch) {
          await addUserToMatch(id, user.email || '');
        }

        setCards(cards);
        setMatch(match);
      } catch (error: any) {
        navigate('/');
      } finally {
        stopLoading();
      }
    }

    if (isLoading) {
      fetchMatch();
    }

    const unsubscribePromise = streamMatch(id, (newMatch) => {
      if (newMatch.exists()) {
        setMatch(newMatch.data());
      }
    });

    return () => {
      stopLoading();
      unsubscribePromise.then((unsbscribe) => unsbscribe());
    };
  }, [id, stopLoading, isLoading, navigate, user]);

  const nextRound = useCallback(async () => {
    await addRoundToMatch(id);
  }, [id]);

  return {
    isLoading,
    match,
    cards,
    nextRound,
  };
}
