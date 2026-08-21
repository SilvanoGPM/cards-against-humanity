import {
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  Unsubscribe,
  arrayUnion,
  doc,
  getDocs,
  increment,
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
import { shuffle } from '@/utils/shuffle';

import { ServerMaintanceError } from '@/lib/ServerMaintanceError';
import { withTimeout } from '@/utils/with-timeout';
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
  previousDecks?: DeckType[];
  playedCardIds?: Set<string>;
  cardsPerPlayer?: number;
  keepCards?: boolean;
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
  const { canPlay } = await withTimeout(getGeneral());

  if (!canPlay) {
    throw new ServerMaintanceError();
  }

  const ownerDoc = doc(usersCollection, ownerId);

  return withTimeout(
    createAny<Omit<MatchType, 'id'>>(matchesCollection, {
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
      cardsPerPlayer: 4,
      keepCards: true,
    })
  );
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

export async function changeCardsPerPlayer(id: string, cardsPerPlayer: number) {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    cardsPerPlayer,
  });
}

export async function changeKeepCards(id: string, keepCards: boolean) {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    keepCards,
  });
}

export async function addUserToMatch(
  id: string,
  userId: string
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);

  await updateDoc(matchDoc, {
    users: arrayUnion(doc(usersCollection, userId)),
    points: arrayUnion({ userId, value: 0 }),
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

      // `increment` em vez de ler-somar-gravar: é atômico (dois clientes
      // calculando a mesma rodada não se sobrescrevem), dispensa uma leitura, e
      // é aceito pela regra que só permite `wins` subir de 1 em 1.
      await updateDoc(doc(usersCollection, winner.userId), {
        wins: increment(1),
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
  previousDecks,
  playedCardIds,
  cardsPerPlayer = 4,
  keepCards = true,
}: SortPlayersDecksParams): Promise<DeckType[]> {
  const awnsers = cards.filter(({ type }) => type === 'WHITE');

  const decks: DeckType[] = [];

  // Pilha de compra: o baralho de respostas é embaralhado uma vez e as cartas
  // saem de cima, sem reposição.
  //
  // A versão anterior sorteava com repetição e chamava a si mesma quando a
  // carta já estava em algum deck — uma recursão sem condição de parada: se
  // `cardsPerPlayer × jogadores` passasse do número de cartas disponíveis, ela
  // nunca encontrava uma carta livre e travava a aba (loop infinito / estouro
  // de pilha). Agora, quando o baralho acaba, o jogador simplesmente recebe uma
  // mão menor e o jogo continua.
  const drawPile = shuffle(awnsers);
  const usedCardIds = new Set<string>();

  let drawIndex = 0;

  function drawAwnser(): CardType | null {
    while (drawIndex < drawPile.length) {
      const card = drawPile[drawIndex];
      drawIndex += 1;

      if (!usedCardIds.has(card.id)) {
        usedCardIds.add(card.id);
        return card;
      }
    }

    return null;
  }

  // As cartas mantidas da rodada anterior são reservadas antes de qualquer
  // sorteio, para que ninguém receba uma carta que já está na mão de outro.
  const keptCardsByUser = new Map<string, DeckType['cards']>();

  users.forEach((user) => {
    const previousDeck = previousDecks?.find((d) => d.user.id === user.uid);

    const keptCards =
      keepCards && previousDeck
        ? previousDeck.cards
            .filter((cardRef) => !playedCardIds?.has(cardRef.id))
            .slice(0, cardsPerPlayer)
        : [];

    keptCards.forEach(({ id }) => usedCardIds.add(id));
    keptCardsByUser.set(user.uid, keptCards);
  });

  let incompleteHands = 0;

  users.forEach((user) => {
    const keptCards = keptCardsByUser.get(user.uid) || [];

    // `Math.max` protege o caso de a configuração da partida ter diminuído o
    // tamanho da mão entre uma rodada e outra.
    const cardsNeeded = Math.max(0, cardsPerPlayer - keptCards.length);

    const newCards = [];

    for (let i = 0; i < cardsNeeded; i += 1) {
      const card = drawAwnser();

      if (!card) {
        incompleteHands += 1;
        break;
      }

      newCards.push(doc(cardsCollection, card.id));
    }

    decks.push({
      user: doc(usersCollection, user.uid),
      cards: [...keptCards, ...newCards],
    });
  });

  if (incompleteHands > 0) {
    const needed = users.length * cardsPerPlayer;

    console.warn(
      `Cartas brancas insuficientes: ${incompleteHands} jogador(es) ficaram com a mão incompleta. ` +
        `Disponíveis: ${awnsers.length}, necessárias: ${needed}.`
    );
  }

  return decks;
}

const pickedQuestionsIds = new Set<string>();

export async function createNewActiveRoundToMatch(id: string): Promise<void> {
  await calculateMatchChanges(id);

  const matchDoc = doc(matchesCollection, id);

  const {
    rounds,
    users: docUsers,
    status,
    actualRound,
    cardsPerPlayer,
    keepCards,
  } = await getMatch(id);

  if (status === 'FINISHED') {
    return;
  }

  const cards = await getCards();

  const usersPromises = docUsers.map(async ({ id }) => getUser(id));
  const users = await Promise.all(usersPromises);

  // Coletar IDs das cartas que foram jogadas na rodada anterior
  const playedCardIds = new Set<string>();
  actualRound?.answers?.forEach(({ card }) => {
    playedCardIds.add(card.id);
  });

  const decks = await sortPlayersDecks({
    users,
    cards,
    previousDecks: actualRound?.decks,
    playedCardIds,
    cardsPerPlayer: cardsPerPlayer || 4,
    keepCards: keepCards ?? true,
  });

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

  await updateDoc(matchDoc, {
    messages: arrayUnion({
      id: crypto.randomUUID(),
      createdAt: Timestamp.now(),
      ...message,
    }),
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
  const playedUser = doc(usersCollection, user);

  const newAnswers = awnsers.map((awnser) => ({
    user: playedUser,
    card: doc(cardsCollection, awnser),
  }));

  await updateDoc(matchDoc, {
    'actualRound.answers': arrayUnion(...newAnswers),
    'actualRound.usersWhoPlayed': arrayUnion({ user: playedUser }),
  } as any);
}

export async function setVoteToActiveRound(
  id: string,
  data: SetVoteData
): Promise<void> {
  const matchDoc = doc(matchesCollection, id);
  const user = doc(usersCollection, data.user);
  const votedUser = doc(usersCollection, data.votedUser);

  await updateDoc(matchDoc, {
    'actualRound.usersWhoVoted': arrayUnion({ user, votedUser }),
  } as any);
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
