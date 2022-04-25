import { CARD_TOKEN } from '@/constants/globals';
import { cardsCollection } from '@/firebase/config';

import { createAny, getAll, getAny } from './core';

let CARDS_CACHE: CardType[] = [];

export async function getCards(): Promise<CardType[]> {
  if (CARDS_CACHE.length === 0) {
    CARDS_CACHE = await getAll<CardType>(cardsCollection);
  }

  return CARDS_CACHE;
}

export function getCard(id: string): Promise<CardType> {
  return getAny<CardType>(cardsCollection, id);
}

export function newCard(card: CardToCreate): Promise<string> {
  const cardToCreate: CardToCreate = card.message.includes(CARD_TOKEN)
    ? { type: 'BLACK', message: card.message }
    : card;

  return createAny<CardToCreate>(cardsCollection, cardToCreate);
}
