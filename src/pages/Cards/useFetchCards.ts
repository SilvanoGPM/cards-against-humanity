import { useBoolean } from '@/hooks/useBoolean';
import { getCards } from '@/services/cards';
import { useEffect, useState } from 'react';

interface UseFetchCardsReturn {
  cards: CardType[];
  error: Error | undefined;
  isLoading: boolean;
}

export function useFetchCards(): UseFetchCardsReturn {
  const [isLoading, , stopLoading] = useBoolean(true);
  const [cards, setCards] = useState<CardType[]>([]);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    async function fetchCards(): Promise<void> {
      try {
        const cards = await getCards();
        setCards(cards);
      } catch (error: any) {
        setError(error);
      } finally {
        stopLoading();
      }
    }

    if (isLoading) {
      fetchCards();
    }
  }, [isLoading, stopLoading]);

  return {
    cards,
    error,
    isLoading,
  };
}
