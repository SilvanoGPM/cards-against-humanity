import {
  updateDoc,
  doc,
  Unsubscribe,
  DocumentSnapshot,
} from 'firebase/firestore';

import { matchesCollection } from '@/firebase/config';

import { createAny, getAll, getAny, streamAny } from './core';

export function getMatches(): Promise<MatchType[]> {
  return getAll<MatchType>(matchesCollection);
}

export async function getMatch(id: string): Promise<MatchType> {
  return getAny<MatchType>(matchesCollection, id);
}

export function newMatch(owner: string): Promise<string> {
  return createAny<MatchType>(matchesCollection, {
    questions: [],
    status: 'PLAYING',
    users: [owner],
    owner,
  });
}

export async function addUserToMatch(id: string, user: string): Promise<void> {
  const data = doc(matchesCollection, id);

  const { users } = await getAny(matchesCollection, id);

  await updateDoc(data, { users: [user, ...users] });
}

export function streamMatch(
  id: string,
  callback: (snapshot: DocumentSnapshot<MatchType>) => void
): Promise<Unsubscribe> {
  return streamAny<MatchType>(matchesCollection, id, callback);
}
