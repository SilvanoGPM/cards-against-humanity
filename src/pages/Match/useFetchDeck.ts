import { useEffect, useState } from 'react';

import { MAX_OF_CARDS_IN_DECK } from '@/constants/globals';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@chakra-ui/react';

interface UseRandomDeckReturn {
  deck: CardType[];
}

export function useFetchDeck(
  match: MatchConvertedType,
  isFirstTime: boolean
): UseRandomDeckReturn {
  const { user } = useAuth();
  const toast = useToast();

  const [deck, setDeck] = useState<CardType[]>([]);

  useEffect(() => {
    const deck = match.actualRound?.decks.find(
      (deck) => deck.user.uid === user.uid
    );

    if (!deck && !isFirstTime) {
      toast({
        title: 'Deck não encontrado',
        description: 'Seu deck não foi encontrado, espera a próxima rodada.',
        status: 'info',
      });
    }

    setDeck(deck?.cards.slice(0, MAX_OF_CARDS_IN_DECK) || []);
  }, [match, user, isFirstTime, toast]);

  return { deck };
}
