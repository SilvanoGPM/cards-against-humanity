import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBoolean } from '@/hooks/useBoolean';
import { getCards } from '@/services/cards';
import { addUserToMatch, getMatch, streamMatch } from '@/services/matches';

interface UseFetchMatchReturn {
  match: MatchType;
  cards: CardType[];
  isLoading: boolean;
}

export function useSetupMatch(id: string): UseFetchMatchReturn {
  const navigate = useNavigate();

  const [isLoading, , stopLoading] = useBoolean(true);

  const [match, setMatch] = useState<MatchType>({
    owner: '',
    questions: [],
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

        const user = `User ${Date.now()}`;

        await addUserToMatch(id, user);

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
  }, [id, stopLoading, isLoading, navigate]);

  return {
    isLoading,
    match,
    cards,
  };
}
