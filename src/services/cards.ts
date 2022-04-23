import { CARD_TOKEN } from '@/constants/globals';
import { cardsCollection } from '@/firebase/config';

import { createAny, getAll } from './core';

export function getCards(): Promise<CardType[]> {
  return getAll<CardType>(cardsCollection);
}

export function newCard(card: CardToCreate): Promise<string> {
  const cardToCreate: CardToCreate = card.message.includes(CARD_TOKEN)
    ? { type: 'BLACK', message: card.message }
    : card;

  return createAny<CardToCreate>(cardsCollection, cardToCreate);
}
