import { useEffect, useState } from 'react';

import { AppToaster } from '@/components/Toast';
import { useBoolean } from '@/hooks/useBoolean';
import { useAuth } from '@/contexts/AuthContext';

interface UseRandomDeckReturn {
  deck: CardType[];
  isLoading: boolean;
}

export function useFetchDeck(match: MatchConvertedType): UseRandomDeckReturn {
  const { user } = useAuth();

  const [deck, setDeck] = useState<CardType[]>([]);
  const [isLoading, , stopLoading] = useBoolean(true);

  useEffect(() => {
    async function getRandomDeck(): Promise<void> {
      try {
        const deck = match.rounds[0].decks.find(
          (deck) => deck.user.uid === user.uid
        );

        if (!deck) {
          AppToaster.show({
            intent: 'danger',
            icon: 'error',
            message: 'Seu deck não foi encontrado!',
          });
        }

        setDeck(deck?.cards || []);
      } catch {
        AppToaster.show({
          intent: 'danger',
          icon: 'error',
          message: 'Não foi possível pegar o deck!',
        });
      } finally {
        stopLoading();
      }
    }

    if (isLoading) {
      getRandomDeck();
    }
  }, [isLoading, stopLoading, match, user]);

  return { deck, isLoading };
}
