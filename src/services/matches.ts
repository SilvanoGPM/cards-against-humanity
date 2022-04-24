import {
  updateDoc,
  doc,
  Unsubscribe,
  DocumentSnapshot,
} from 'firebase/firestore';

import {
  cardsCollection,
  matchesCollection,
  usersCollection,
} from '@/firebase/config';
import { getRandomItem } from '@/utils/getRandomItem';

import { createAny, getAll, getAny, streamAny } from './core';
import { getCards } from './cards';

interface SetAwnserData {
  awnsers: string[];
  user: string;
  cards: string[];
}

export function getMatches(): Promise<MatchType[]> {
  return getAll<MatchType>(matchesCollection);
}

export async function getMatch(id: string): Promise<MatchType> {
  return getAny<MatchType>(matchesCollection, id);
}

export function newMatch(ownerId: string): Promise<string> {
  const ownerDoc = doc(usersCollection, ownerId);

  return createAny<Omit<MatchType, 'id'>>(matchesCollection, {
    rounds: [],
    status: 'PLAYING',
    users: [ownerDoc],
    owner: ownerDoc,
  });
}

export async function addUserToMatch(
  id: string,
  userId: string
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { users } = await getMatch(id);

  await updateDoc(matchDoc, {
    users: [doc(usersCollection, userId), ...users],
  });
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

export async function setAnswerToLastRound(
  id: string,
  { awnsers, cards, user }: SetAwnserData
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { rounds } = await getMatch(id);

  const [lastRound, ...otherRounds] = rounds;

  const playedUser = doc(usersCollection, user);

  const newanswers = awnsers.map((awnser) => ({
    user: playedUser,
    card: doc(cardsCollection, awnser),
  }));

  const answers = [...lastRound.answers, ...newanswers];

  const cardsOfUser = cards.map((card) => doc(cardsCollection, card));

  const userWhoPlayed = { cards: cardsOfUser, user: playedUser };

  const usersWhoPlayed = [...lastRound.usersWhoPlayed, userWhoPlayed];

  const newLastRound = { ...lastRound, answers, usersWhoPlayed };

  const newRounds = [newLastRound, ...otherRounds];

  await updateDoc(matchDoc, {
    rounds: newRounds,
  });
}

export function streamMatch(
  id: string,
  callback: (snapshot: DocumentSnapshot<MatchType>) => void
): Promise<Unsubscribe> {
  return streamAny<MatchType>(matchesCollection, id, callback);
}
