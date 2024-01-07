import { AppToaster } from '@/components/Toast';
import { getCards } from '@/services/cards';
import { useEffect, useState } from 'react';

interface UseFetchCardsReturn {
  cards: CardType[];
  isLoading: boolean;
}

export function useFetchCards(): UseFetchCardsReturn {
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadCards(): Promise<void> {
      try {
        const cards = await getCards();
        setCards(cards);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoading) {
      loadCards();
    }
  }, [isLoading]);

  if (isError) {
    AppToaster.show({
      intent: 'danger',
      icon: 'error',
      message: 'Não foi possível carregar as cartas',
    });

    return { cards: [], isLoading: false };
  }

  return {
    cards,
    isLoading,
  };
}
