import { cardsCollection } from '@/firebase/config';

import { getAll } from './core';

export function getCards(): Promise<CardType[]> {
  return getAll<CardType>(cardsCollection);
}
