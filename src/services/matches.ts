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
import { getGeneral } from './general';
import { getUser } from './users';

interface SetAwnserData {
  awnsers: string[];
  user: string;
}

interface SetVoteData {
  user: string;
  votedUser: string;
}

interface SortPlayersDecksParams {
  users: UserType[];
  cards: CardType[];
}

export function getMatches(): Promise<MatchType[]> {
  return getAll<MatchType>(matchesCollection);
}

export async function getLastMatches(
  size = 10,
  onlyPublics = true
): Promise<MatchType[]> {
  const data = await getDocs(
    query(
      matchesCollection,
      where('status', '==', 'PLAYING'),
      ...(onlyPublics ? [where('type', '==', 'PUBLIC')] : []),
      limit(size)
    )
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
    type: 'PRIVATE',
    users: [ownerDoc],
    owner: ownerDoc,
    messages: [],
    points: [{ userId: ownerId, value: 0 }],
    createdAt: Timestamp.now(),
    shouldShowCardOwner: false,
    pointsToWin: 20,
  });
}

export async function changeVisibility(id: string, type: 'PUBLIC' | 'PRIVATE') {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    type,
  });
}

export async function changePointsToWin(id: string, points: number) {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    pointsToWin: points,
  });
}

export async function addUserToMatch(
  id: string,
  userId: string
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { users, points } = await getMatch(id);

  await updateDoc(matchDoc, {
    users: [doc(usersCollection, userId), ...users],
    points: [...points, { userId, value: 0 }],
  });
}

export async function playingMatch(id: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    status: 'PLAYING',
  });
}

export async function calculateMatchChanges(id: string): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { points, actualRound, pointsToWin } = await getMatch(id);

  // Calcular os pontos da rodada atual
  actualRound?.usersWhoVoted?.forEach(({ votedUser }) => {
    const userId = votedUser.id;

    const userPoint = points.find(({ userId: id }) => id === userId);

    if (userPoint) {
      userPoint.value += 1;
    }
  });

  const reachedWinsPoints = points.filter(({ value }) => value >= pointsToWin);

  if (reachedWinsPoints.length > 0) {
    const maxPoints = Math.max(...reachedWinsPoints.map(({ value }) => value));

    const winners = reachedWinsPoints.filter(
      ({ value }) => value === maxPoints
    )!;

    // Verifica se somente um jogador atingiu os pontos necessários para vencer
    // Se mais de um jogador atingir os pontos, o jogo continua até o desempate
    if (winners.length === 1) {
      const winner = winners[0];

      await updateDoc(matchDoc, {
        status: 'FINISHED',
        winner: doc(usersCollection, winner.userId),
      });

      const userWinner = await getUser(winner.userId);

      await updateDoc(doc(usersCollection, winner.userId), {
        wins: (userWinner.wins || 0) + 1,
      });

      return;
    }
  }

  await updateDoc(matchDoc, {
    status: 'LOADING',
    points,
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

  function getRandomAwnser(user: UserType): CardType {
    const random = getRandomItem(awnsers);
    const hasCard = decks.some(({ cards }) =>
      cards.find(({ id }) => id === random.id)
    );

    if (hasCard) {
      return getRandomAwnser(user);
    }

    return random;
  }

  users.forEach((user) => {
    const cards = Array(CARDS_IN_DECK)
      .fill('')
      .map(() => getRandomAwnser(user))
      .map(({ id }) => doc(cardsCollection, id));

    const deck: DeckType = {
      user: doc(usersCollection, user.uid),
      cards,
    };

    decks.push(deck);
  });

  return decks;
}

const pickedQuestionsIds = new Set<string>();

export async function createNewActiveRoundToMatch(id: string): Promise<void> {
  await calculateMatchChanges(id);

  const matchDoc = doc(matchesCollection, id);

  const { rounds, users: docUsers, status } = await getMatch(id);

  if (status === 'FINISHED') {
    return;
  }

  const cards = await getCards();

  const usersPromises = docUsers.map(async ({ id }) => getUser(id));
  const users = await Promise.all(usersPromises);

  const decks = await sortPlayersDecks({ users, cards });

  const questions = cards.filter(({ type }) => type === 'BLACK');

  function getNextQuestion(): CardType {
    const percentQuestionsPicked = pickedQuestionsIds.size / questions.length;
    const isALotOfQuestionsPicked = percentQuestionsPicked >= 0.8;

    if (isALotOfQuestionsPicked) {
      pickedQuestionsIds.clear();
    }

    const question = getRandomItem(questions);

    if (pickedQuestionsIds.has(question.id)) {
      return getNextQuestion();
    }

    pickedQuestionsIds.add(question.id);

    return question;
  }

  const { id: questionId } = getNextQuestion();

  await updateDoc(matchDoc, {
    rounds: rounds + 1,
    status: 'PLAYING',
    shouldShowCardOwner: false,
    actualRound: {
      question: doc(cardsCollection, questionId),
      answers: [],
      usersWhoPlayed: [],
      usersWhoVoted: [],
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

export async function setShouldShowCardOwner(
  id: string,
  shouldShowCardOwner: boolean
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    shouldShowCardOwner,
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

export async function setVoteToActiveRound(
  id: string,
  data: SetVoteData
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  const { actualRound } = await getMatch(id);

  if (!actualRound) {
    return;
  }

  const user = doc(usersCollection, data.user);
  const votedUser = doc(usersCollection, data.votedUser);

  const usersWhoVoted = [
    ...(actualRound?.usersWhoVoted || []),
    {
      user,
      votedUser,
    },
  ];

  const updatedActualRound = { ...actualRound, usersWhoVoted };

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

  const usersWhoVotedPromises =
    round?.usersWhoVoted?.map(async ({ user, votedUser }) => ({
      user: await getUser(user.id),
      votedUser: await getUser(votedUser.id),
    })) || [];

  const decksPromises = round.decks.map(async ({ cards, user }) => ({
    cards: await Promise.all(cards.map(async ({ id }) => getCard(id))),
    user: await getUser(user.id),
  }));

  const question = await getCard(round.question.id);
  const answers = await Promise.all(answersPromises);
  const usersWhoPlayed = await Promise.all(usersWhoPlayedPromises);
  const usersWhoVoted = await Promise.all(usersWhoVotedPromises);
  const decks = await Promise.all(decksPromises);

  return {
    answers,
    usersWhoPlayed,
    usersWhoVoted,
    question,
    decks,
  };
}

export async function convertMatch(
  match: MatchType
): Promise<MatchConvertedType> {
  const usersPromises = match?.users?.map(async ({ id }) => getUser(id));

  const convertedOwner = await getUser(match.owner.id);
  const convertedWinner = match.winner ? await getUser(match.winner.id) : null;
  const convertedUsers = await Promise.all(usersPromises);

  const convertedActualRound = await getActualRound(match.actualRound);

  return {
    ...match,
    owner: convertedOwner,
    winner: convertedWinner,
    users: convertedUsers,
    actualRound: convertedActualRound,
  } as MatchConvertedType;
}
