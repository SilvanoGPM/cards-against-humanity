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
import { getUser } from './users';

interface SetAwnserData {
  awnsers: string[];
  user: string;
}

interface SortPlayersDecksParams {
  users: UserType[];
  cards: CardType[];
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

export async function finisMatch(id: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    status: 'FINISHED',
  });
}

export async function sortPlayersDecks({
  users,
  cards,
}: SortPlayersDecksParams): Promise<DeckType[]> {
  const CARDS_IN_DECK = 4;

  const awnsers = cards.filter(({ type }) => type === 'WHITE');

  const decks: DeckType[] = [];

  function getRandomAwnser(): CardType {
    const random = getRandomItem(awnsers);
    const hasCard = decks.some(({ cards }) =>
      cards.find(({ id }) => id === random.id)
    );

    if (hasCard) {
      return getRandomAwnser();
    }

    return random;
  }

  users.forEach((user) => {
    const cards = Array(CARDS_IN_DECK)
      .fill('')
      .map(getRandomAwnser)
      .map(({ id }) => doc(cardsCollection, id));

    const deck: DeckType = {
      user: doc(usersCollection, user.uid),
      cards,
    };

    decks.push(deck);
  });

  return decks;
}

export async function addRoundToMatch(id: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { rounds, users: docUsers } = await getMatch(id);

  const cards = await getCards();

  const usersPromises = docUsers.map(async ({ id }) => getUser(id));
  const users = await Promise.all(usersPromises);

  const decks = await sortPlayersDecks({ users, cards });

  const { id: questionId } = getRandomItem(
    cards.filter(({ type }) => type === 'BLACK')
  );

  await updateDoc(matchDoc, {
    rounds: [
      {
        question: doc(cardsCollection, questionId),
        answers: [],
        usersWhoPlayed: [],
        decks,
      },
      ...(rounds as any),
    ],
  });
}

export async function setAnswerToLastRound(
  id: string,
  { awnsers, user }: SetAwnserData
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { rounds } = await getMatch(id);

  const [lastRound, ...otherRounds] = rounds;

  const playedUser = doc(usersCollection, user);

  const newAnswers = awnsers.map((awnser) => ({
    user: playedUser,
    card: doc(cardsCollection, awnser),
  }));

  const answers = [...lastRound.answers, ...newAnswers];

  const usersWhoPlayed = [...lastRound.usersWhoPlayed, { user: playedUser }];

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
