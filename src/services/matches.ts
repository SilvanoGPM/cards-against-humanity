import {
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  Unsubscribe,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  cardsCollection,
  matchesCollection,
  usersCollection,
} from '@/firebase/config';

import { getRandomItem } from '@/utils/get-random-item';

import { ServerMaintanceError } from '@/lib/ServerMaintanceError';
import { getCard, getCards } from './cards';
import { createAny, getAll, getAny, mapValue, streamAny } from './core';
import { getUser } from './users';
import { getGeneral } from './general';

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

export async function newMatch(ownerId: string): Promise<string> {
  const { canPlay } = await getGeneral();

  if (!canPlay) {
    throw new ServerMaintanceError();
  }

  const ownerDoc = doc(usersCollection, ownerId);

  return createAny<Omit<MatchType, 'id'>>(matchesCollection, {
    rounds: 0,
    status: 'PLAYING',
    users: [ownerDoc],
    owner: ownerDoc,
    messages: [],
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

export async function playingMatch(id: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    status: 'PLAYING',
  });
}

export async function loadingMatch(id: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    status: 'LOADING',
  });
}

export async function finishMatch(id: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    status: 'FINISHED',
  });
}

export async function finishAllMatches(
  matches: MatchConvertedType[]
): Promise<void> {
  matches.forEach(async ({ id }) => {
    finishMatch(id);
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

export async function createNewActiveRoundToMatch(id: string): Promise<void> {
  await loadingMatch(id);

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
    rounds: rounds + 1,
    status: 'PLAYING',
    actualRound: {
      question: doc(cardsCollection, questionId),
      answers: [],
      usersWhoPlayed: [],
      decks,
    },
  });
}

export async function addMessageToMatch(
  id: string,
  message: Omit<MatchMessage, 'id' | 'createdAt'>
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { messages } = await getMatch(id);

  await updateDoc(matchDoc, {
    messages: [
      // FIXME: Arrumar isso
      ...(messages as any),
      {
        id: crypto.randomUUID(),
        createdAt: Timestamp.now(),
        ...message,
      },
    ],
  });
}

export async function setAnswerToActiveRound(
  id: string,
  { awnsers, user }: SetAwnserData
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { actualRound } = await getMatch(id);

  if (!actualRound) {
    return;
  }

  const playedUser = doc(usersCollection, user);

  const newAnswers = awnsers.map((awnser) => ({
    user: playedUser,
    card: doc(cardsCollection, awnser),
  }));

  const answers = [...actualRound.answers, ...newAnswers];

  const usersWhoPlayed = [...actualRound.usersWhoPlayed, { user: playedUser }];

  const updatedActualRound = { ...actualRound, answers, usersWhoPlayed };

  await updateDoc(matchDoc, {
    actualRound: updatedActualRound,
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
    query(matchesCollection, where('status', '!=', 'FINISHED')),
    callback
  );

  return unsubscribe;
}

export async function getActualRound(
  round?: RoundType | null
): Promise<RoundConvertedType | null> {
  if (!round) {
    return null;
  }

  const answersPromises = round.answers.map(async ({ card, user }) => ({
    card: await getCard(card.id),
    user: await getUser(user.id),
  }));

  const usersWhoPlayedPromises = round.usersWhoPlayed.map(async ({ user }) => ({
    user: await getUser(user.id),
  }));

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
}

export async function convertMatch(
  match: MatchType
): Promise<MatchConvertedType> {
  const usersPromises = match?.users?.map(async ({ id }) => getUser(id));

  const convertedOwner = await getUser(match.owner.id);
  const convertedUsers = await Promise.all(usersPromises);

  const convertedActualRound = await getActualRound(match.actualRound);

  return {
    ...match,
    owner: convertedOwner,
    users: convertedUsers,
    actualRound: convertedActualRound,
  } as MatchConvertedType;
}
