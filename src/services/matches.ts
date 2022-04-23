import {
  updateDoc,
  doc,
  Unsubscribe,
  DocumentSnapshot,
} from 'firebase/firestore';

import { cardsCollection, matchesCollection } from '@/firebase/config';
import { getRandomItem } from '@/utils/getRandomItem';

import { createAny, getAll, getAny, streamAny } from './core';
import { getCards } from './cards';

export function getMatches(): Promise<MatchType[]> {
  return getAll<MatchType>(matchesCollection);
}

export async function getMatch(id: string): Promise<MatchType> {
  return getAny<MatchType>(matchesCollection, id);
}

export function newMatch(owner: string): Promise<string> {
  return createAny<Omit<MatchType, 'id'>>(matchesCollection, {
    rounds: [],
    status: 'PLAYING',
    users: [owner],
    owner,
  });
}

export async function addUserToMatch(id: string, user: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { users } = await getMatch(id);

  await updateDoc(matchDoc, { users: [user, ...users] });
}

export async function addRoundToMatch(id: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { rounds } = await getMatch(id);

  const cards = await getCards();

  const { id: cardId } = getRandomItem(
    cards.filter(({ type }) => type === 'BLACK')
  );

  await updateDoc(matchDoc, {
    rounds: [
      {
        question: doc(cardsCollection, cardId),
        answers: [],
        usersWhoPlayed: [],
      },
      ...(rounds as any),
    ],
  });
}

export function streamMatch(
  id: string,
  callback: (snapshot: DocumentSnapshot<MatchType>) => void
): Promise<Unsubscribe> {
  return streamAny<MatchType>(matchesCollection, id, callback);
}
