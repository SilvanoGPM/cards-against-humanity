import { useEffect, useState } from 'react';

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

  const cardsPerPlayer = match.cardsPerPlayer || 4;

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

    setDeck(deck?.cards.slice(0, cardsPerPlayer) || []);
  }, [match, user, isFirstTime, toast, cardsPerPlayer]);

  return { deck };
}
