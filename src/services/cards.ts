import { CARD_TOKEN } from '@/constants/globals';
import { cardsCollection } from '@/firebase/config';

import Repository from '@/lib/Repository';
import { createAny, getAll, getAny } from './core';
import { getGeneral, updateTotalCards } from './general';

const CARDS_KEY = '@CARDS_AGAINST_HUMANITY/CARDS';

let CARDS_CACHE: CardType[] = Repository.get<CardType[]>(CARDS_KEY) || [];

let hasCheckedIfShouldRefetchCards = false;

async function saveCardsOnCache() {
  CARDS_CACHE = await getAll<CardType>(cardsCollection);
  Repository.save(CARDS_KEY, CARDS_CACHE);
}

async function cacheCards(): Promise<void> {
  if (CARDS_CACHE.length === 0) {
    saveCardsOnCache();

    return;
  }

  if (!hasCheckedIfShouldRefetchCards) {
    hasCheckedIfShouldRefetchCards = true;

    const { totalCards } = await getGeneral();

    if (totalCards > CARDS_CACHE.length) {
      saveCardsOnCache();
    }
  }
}

export async function getCards(): Promise<CardType[]> {
  await cacheCards();

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

export async function newCard(card: CardToCreate): Promise<string> {
  const cardToCreate: CardToCreate = card.message.includes(CARD_TOKEN)
    ? { type: 'BLACK', message: card.message }
    : card;

  const cardId = await createAny<CardToCreate>(cardsCollection, cardToCreate);

  await updateTotalCards(CARDS_CACHE.length + 1);

  return cardId;
}
