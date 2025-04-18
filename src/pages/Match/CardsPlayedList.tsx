import { Card } from '@/components/Card';

import { getUserName } from '@/utils/get-user-name';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Icon,
  Text,
  useToast,
} from '@chakra-ui/react';

import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { setVoteToActiveRound } from '@/services/matches';
import { getErrorMessage } from '@/utils/get-error-message';
import { FaStar, FaVoteYea } from 'react-icons/fa';
import styles from './styles.module.scss';

interface CardsPlayedListProps {
  match: MatchConvertedType;
}

interface GroupedAnswersType {
  user: UserType;
  cards: CardType[];
}

export function CardsPlayedList({ match }: CardsPlayedListProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [isVoting, setTrueVoting, setFalseVoting] = useBoolean(false);

  const userAlreadyVoted = match?.actualRound?.usersWhoVoted?.find(
    (otherUser) => otherUser.user.uid === user?.uid
  );

  const groupedAnswers =
    match.actualRound?.answers.reduce<GroupedAnswersType[]>(
      (grouped, { card, user }) => {
        const groupFound = grouped.find((group) => group.user.uid === user.uid);

        if (groupFound) {
          groupFound.cards.push(card);
          return grouped;
        }

        return [...grouped, { user, cards: [card] }];
      },
      []
    ) || [];

  async function confirmVote(votedUser: string) {
    try {
      if (userAlreadyVoted) {
        toast({
          title: 'Você já votou',
          status: 'info',
        });

        return;
      }

      setTrueVoting();

      const data = {
        user: user.uid,
        votedUser,
      };

      await setVoteToActiveRound(match.id, data);
    } catch (error) {
      console.error('error', error);

      const description = getErrorMessage(
        error,
        'Não foi possível votar nesta carta.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      setFalseVoting();
    }
  }

  function renderCard(card: CardType, isActive: boolean): JSX.Element {
    return (
      <Card
        animationClickShowBack={isActive}
        key={card.id}
        {...card}
        animationType="click"
        className={styles.card}
        frontClassName={styles.cardFront}
        backClassName={styles.cardBack}
        messageClassName={styles.cardText}
      />
    );
  }

  function renderAnswers(
    group: GroupedAnswersType,
    index: number
  ): JSX.Element | null {
    const name = getUserName(group.user);
    const isMyGroup = group.user.uid === user?.uid;

    return (
      <Flex key={group.user.uid} gap="4" align="center">
        <Flex flexDir="column" gap="4">
          <Flex gap="2" alignItems="center">
            <Avatar
              bg="black"
              color="white"
              name={match.shouldShowCardOwner || isMyGroup ? name : 'Anônimo'}
              src={
                match.shouldShowCardOwner || isMyGroup
                  ? group.user.photoURL!
                  : undefined
              }
            />

            <Flex direction="column" color="secondary" w="full">
              <Text
                fontWeight="bold"
                overflow="hidden"
                whiteSpace="nowrap"
                maxW="80%"
                textOverflow="ellipsis"
              >
                {match.shouldShowCardOwner || isMyGroup ? name : 'Anônimo'}
              </Text>

              {(match.shouldShowCardOwner || isMyGroup) && (
                <Text fontSize="smaller" color="gray.500" mt="-1">
                  Pontos:{' '}
                  {match?.points.find(
                    (point) => point.userId === group.user.uid
                  )?.value || 0}
                </Text>
              )}
            </Flex>
          </Flex>

          {!isMyGroup ? (
            <Button
              mx="auto"
              isLoading={isVoting}
              isDisabled={Boolean(userAlreadyVoted)}
              fontSize="sm"
              leftIcon={<Icon as={FaVoteYea} />}
              onClick={() => confirmVote(group.user.uid)}
            >
              {userAlreadyVoted
                ? `${
                    userAlreadyVoted.votedUser.uid === group.user.uid
                      ? 'Você votou nessa'
                      : 'Você já votou'
                  }`
                : 'Votar nessa'}
            </Button>
          ) : (
            <Box h="10" />
          )}

          <HStack>{group.cards.map((card) => renderCard(card, true))}</HStack>

          <Center mx="auto" gap="1" flexWrap="wrap" maxW="200px" minH="6">
            {match.actualRound?.usersWhoVoted
              .filter(({ votedUser }) => group.user.uid === votedUser.uid)
              .map(({ votedUser }) => {
                return (
                  <Center
                    key={votedUser.uid}
                    bgColor="black"
                    w="6"
                    h="6"
                    rounded="full"
                  >
                    <Icon as={FaStar} color="white" fontSize="sm" />
                  </Center>
                );
              })}
          </Center>
        </Flex>

        {index !== groupedAnswers.length - 1 && (
          <Box h="320px" w="3px" bg="gray.200" mr="2" />
        )}
      </Flex>
    );
  }

  const hasCardsPlayed = (match?.actualRound?.answers.length || 0) > 0;

  if (match.rounds === 0 || !hasCardsPlayed) {
    return null;
  }

  return (
    <Flex flexDir="column" w="full" mt="4">
      <Heading as="h2" fontSize="2xl" mb="4" ml="4">
        Respostas:
      </Heading>

      <HStack overflowX="scroll" overflowY="visible" px="4" py="8">
        {groupedAnswers.map((group, index) => renderAnswers(group, index))}
      </HStack>
    </Flex>
  );
}
