import { getCards } from '@/services/cards';
import { getErrorMessage } from '@/utils/get-error-message';
import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface UseFetchCardsReturn {
  cards: CardType[];
  isLoading: boolean;
}

export function useFetchCards(): UseFetchCardsReturn {
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const toast = useToast();

  useEffect(() => {
    async function loadCards(): Promise<void> {
      try {
        const cards = await getCards();
        setCards(cards);
      } catch (error) {
        console.error('error', error);

        const description = getErrorMessage(
          error,
          'Não foi possível carregar as cartas.'
        );

        toast({
          description,
          title: 'Aconteceu um erro',
          status: 'error',
        });

        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoading) {
      loadCards();
    }
  }, [isLoading, toast]);

  if (isError) {
    return { cards: [], isLoading: false };
  }

  return {
    cards,
    isLoading,
  };
}
