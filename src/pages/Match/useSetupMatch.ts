import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  addRoundToMatch,
  addUserToMatch,
  getMatch,
  streamMatch,
} from '@/services/matches';

import { useBoolean } from '@/hooks/useBoolean';
import { getCard, getCards } from '@/services/cards';
import { useAuth } from '@/contexts/AuthContext';
import { getUser } from '@/services/users';
import { AppToaster } from '@/components/Toast';

interface UseFetchMatchReturn {
  match: MatchConvertedType;
  cards: CardType[];
  isLoading: boolean;
  loadingNext: boolean;
  nextRound: () => void;
}

export function useSetupMatch(id: string): UseFetchMatchReturn {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, , stopLoading] = useBoolean(true);
  const [loadingNext, startLoadingNext, stopLoadingNext] = useBoolean(false);

  const [match, setMatch] = useState<MatchConvertedType>(
    {} as MatchConvertedType
  );

  const [cards, setCards] = useState<CardType[]>([]);

  const convertMatch = useCallback(async (match: MatchType) => {
    const usersPromises = match.users.map(async ({ id }) => getUser(id));

    const roundsPromises = match.rounds.map(async (round) => {
      const answersPromises = round.answers.map(async ({ card, user }) => ({
        card: await getCard(card.id),
        user: await getUser(user.id),
      }));

      const usersWhoPlayedPromises = round.usersWhoPlayed.map(
        async ({ cards, user }) => ({
          cards: await Promise.all(cards.map(async ({ id }) => getCard(id))),
          user: await getUser(user.id),
        })
      );

      const question = await getCard(round.question.id);
      const answers = await Promise.all(answersPromises);
      const usersWhoPlayed = await Promise.all(usersWhoPlayedPromises);

      return {
        answers,
        usersWhoPlayed,
        question,
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
  }, []);

  useEffect(() => {
    async function fetchMatch(): Promise<void> {
      try {
        const match = await getMatch(id);

        const hasMatchNotFinished =
          !match.status || match.status === 'FINISHED';

        if (hasMatchNotFinished) {
          navigate('/');
          return;
        }

        const cards = await getCards();

        const userIsInTheMatch = match.users.find(
          (innerUser) => innerUser.id === user.uid
        );

        if (!userIsInTheMatch) {
          await addUserToMatch(id, user.uid);
        }

        const convertedMatch = await convertMatch(match);

        setCards(cards);
        setMatch(convertedMatch);
      } catch (error: any) {
        navigate('/');
      } finally {
        stopLoading();
      }
    }

    if (isLoading) {
      fetchMatch();
    }

    const unsubscribePromise = streamMatch(id, async (newMatch) => {
      if (newMatch.exists()) {
        const convertedMatch = await convertMatch({
          ...newMatch.data(),
          id: newMatch.id,
        });

        setMatch(convertedMatch);
      }
    });

    return () => {
      stopLoading();
      unsubscribePromise.then((unsbscribe) => unsbscribe());
    };
  }, [id, stopLoading, isLoading, navigate, user, convertMatch]);

  const nextRound = useCallback(async () => {
    try {
      startLoadingNext();
      await addRoundToMatch(id);
    } catch {
      AppToaster.show({
        intent: 'danger',
        icon: 'error',
        message: 'Aconteceu um erro ao tentar carregar a próxima rodada',
      });
    } finally {
      stopLoadingNext();
    }
  }, [id, startLoadingNext, stopLoadingNext]);

  return {
    isLoading,
    loadingNext,
    match,
    cards,
    nextRound,
  };
}
