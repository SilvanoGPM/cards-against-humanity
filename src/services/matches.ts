import {
  updateDoc,
  doc,
  Unsubscribe,
  DocumentSnapshot,
  limit,
  query,
  where,
  getDocs,
  onSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';

import {
  cardsCollection,
  matchesCollection,
  usersCollection,
} from '@/firebase/config';

import { getRandomItem } from '@/utils/getRandomItem';

import { createAny, getAll, getAny, mapValue, streamAny } from './core';
import { getCard, getCards } from './cards';
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

export async function getLastMatches(size = 10): Promise<MatchType[]> {
  const data = await getDocs(
    query(matchesCollection, where('status', '==', 'PLAYING'), limit(size))
  );

  return mapValue(data);
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

export async function finishMatch(id: string): Promise<void> {
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

export async function streamMatches(
  callback: (snapshot: QuerySnapshot<MatchType>) => void
): Promise<Unsubscribe> {
  const unsubscribe = onSnapshot(
    query(matchesCollection, where('status', '==', 'PLAYING')),
    callback
  );

  return unsubscribe;
}

export async function convertMatch(
  match: MatchType
): Promise<MatchConvertedType> {
  const usersPromises = match.users.map(async ({ id }) => getUser(id));

  const roundsPromises = match.rounds.map(async (round) => {
    const answersPromises = round.answers.map(async ({ card, user }) => ({
      card: await getCard(card.id),
      user: await getUser(user.id),
    }));

    const usersWhoPlayedPromises = round.usersWhoPlayed.map(
      async ({ user }) => ({
        user: await getUser(user.id),
      })
    );

    const decksPromises = round.decks.map(async ({ cards, user }) => ({
      cards: await Promise.all(cards.map(async ({ id }) => getCard(id))),
      user: await getUser(user.id),
    }));

    const question = await getCard(round.question.id);
    const answers = await Promise.all(answersPromises);
    const usersWhoPlayed = await Promise.all(usersWhoPlayedPromises);
    const decks = await Promise.all(decksPromises);

    return {
      answers,
      usersWhoPlayed,
      question,
      decks,
    };
  });

  const convertedOwner = await getUser(match.owner.id);
  const convertedUsers = await Promise.all(usersPromises);
  const convertedRounds = await Promise.all(roundsPromises);

  return {
    ...match,
    owner: convertedOwner,
    users: convertedUsers,
    rounds: convertedRounds,
  } as MatchConvertedType;
}
