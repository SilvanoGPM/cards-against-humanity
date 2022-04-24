import { useFirestoreQuery } from '@react-query-firebase/firestore';

import { query } from 'firebase/firestore';

import { AppToaster } from '@/components/Toast';
import { cardsCollection } from '@/firebase/config';

interface UseFetchCardsReturn {
  cards: CardType[];
  isLoading: boolean;
}

export function useFetchCards(): UseFetchCardsReturn {
  const ref = query(cardsCollection);

  const { data, isLoading, isError } = useFirestoreQuery(['cards'], ref);

  if (isError) {
    AppToaster.show({
      intent: 'danger',
      icon: 'error',
      message: 'Não foi possível carregar as cartas',
    });

    return { cards: [], isLoading: false };
  }

  const cards =
    data?.docs.map((snapshot) => ({
      ...snapshot.data(),
      id: snapshot.id,
    })) || [];

  return {
    cards,
    isLoading,
  };
}
