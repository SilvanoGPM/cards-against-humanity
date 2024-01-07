import { CARD_TOKEN } from '@/constants/globals';
import { cardsCollection } from '@/firebase/config';

import Repository from '@/lib/Repository';
import { createAny, getAll, getAny } from './core';

const CARDS_KEY = '@CARDS_AGAINST_HUMANITY/CARDS';

let CARDS_CACHE: CardType[] = Repository.get<CardType[]>(CARDS_KEY) || [];

export async function cacheCards(): Promise<void> {
  if (CARDS_CACHE.length === 0) {
    console.log('aqui');
    CARDS_CACHE = await getAll<CardType>(cardsCollection);
    Repository.save(CARDS_KEY, CARDS_CACHE);
  }
}

export async function getCards(): Promise<CardType[]> {
  await cacheCards();

  console.log('getCards');

  return CARDS_CACHE;
}

export async function getCard(id: string): Promise<CardType> {
  await cacheCards();

  const card =
    CARDS_CACHE.length === 0
      ? await getAny<CardType>(cardsCollection, id)
      : CARDS_CACHE.find((card) => card.id === id)!;

  return card;
}

export function newCard(card: CardToCreate): Promise<string> {
  const cardToCreate: CardToCreate = card.message.includes(CARD_TOKEN)
    ? { type: 'BLACK', message: card.message }
    : card;

  return createAny<CardToCreate>(cardsCollection, cardToCreate);
}
