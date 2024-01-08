import { useEffect, useState } from 'react';

import { AppToaster } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { MAX_OF_CARDS_IN_DECK } from '@/constants/globals';

interface UseRandomDeckReturn {
  deck: CardType[];
}

export function useFetchDeck(
  match: MatchConvertedType,
  isFirstTime: boolean
): UseRandomDeckReturn {
  const { user } = useAuth();

  const [deck, setDeck] = useState<CardType[]>([]);

  useEffect(() => {
    const deck = match.actualRound?.decks.find(
      (deck) => deck.user.uid === user.uid
    );

    if (!deck && !isFirstTime) {
      AppToaster.show({
        intent: 'danger',
        icon: 'error',
        message: 'Seu deck não foi encontrado!',
      });
    }

    setDeck(deck?.cards.slice(0, MAX_OF_CARDS_IN_DECK) || []);
  }, [match, user, isFirstTime]);

  return { deck };
}
