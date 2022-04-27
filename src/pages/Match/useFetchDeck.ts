import { useEffect, useState } from 'react';

import { AppToaster } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';

interface UseRandomDeckReturn {
  deck: CardType[];
}

const MAX_OF_CARDS_IN_DECK = 4;

export function useFetchDeck(
  match: MatchConvertedType,
  isFirstTime: boolean
): UseRandomDeckReturn {
  const { user } = useAuth();

  const [deck, setDeck] = useState<CardType[]>([]);

  useEffect(() => {
    const deck = match.rounds[0].decks.find(
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
