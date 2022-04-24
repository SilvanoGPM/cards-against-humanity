import { CARD_TOKEN } from '@/constants/globals';
import { cardsCollection } from '@/firebase/config';
import { getRandomItem } from '@/utils/getRandomItem';

import { createAny, getAll, getAny } from './core';

let CARDS_CACHE: CardType[] = [];

export async function getCards(): Promise<CardType[]> {
  if (!CARDS_CACHE) {
    CARDS_CACHE = await getAll<CardType>(cardsCollection);
  }

  return CARDS_CACHE;
}

export async function getDeck(limit = 4): Promise<CardType[]> {
  const cards = await getCards();
  const awnsers = cards.filter(({ type }) => type === 'WHITE');

  const deck: CardType[] = [];

  function getRandomAwnser(): CardType {
    const random = getRandomItem(awnsers);
    const hasCard = deck.find(({ id }) => id === random.id);

    if (hasCard) {
      return getRandomAwnser();
    }

    return random;
  }

  for (let i = 0; i < limit; i += 1) {
    const awnser = getRandomAwnser();
    deck.push(awnser);
  }

  return deck;
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
