import { useEffect, useState } from 'react';

import { AppToaster } from '@/components/Toast';
import { useBoolean } from '@/hooks/useBoolean';
import { getDeck } from '@/services/cards';

interface UseRandomDeckReturn {
  deck: CardType[];
  isLoading: boolean;
}

export function useRandomDeck(): UseRandomDeckReturn {
  const [deck, setDeck] = useState<CardType[]>([]);
  const [isLoading, , stopLoading] = useBoolean(true);

  useEffect(() => {
    async function getRandomDeck(): Promise<void> {
      try {
        const deck = await getDeck();
        setDeck(deck);
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
  }, [isLoading, stopLoading]);

  return { deck, isLoading };
}
