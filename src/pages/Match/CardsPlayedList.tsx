import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';

import { getUserName } from '@/utils/get-user-name';
import { Avatar, Box, Flex, HStack, Heading, Text } from '@chakra-ui/react';

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

    return (
      <Flex key={group.user.uid} gap="4" align="center">
        <Flex flexDir="column" gap="8">
          <Flex gap="2">
            <Avatar
              bg="black"
              color="white"
              name={name}
              src={group.user.photoURL!}
            />

            <Flex direction="column" color="secondary" w="full">
              <Text
                fontWeight="bold"
                overflow="hidden"
                whiteSpace="nowrap"
                maxW="80%"
                textOverflow="ellipsis"
              >
                {name}
              </Text>

              <Text
                fontSize="sm"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                maxW="80%"
                mt="-1"
              >
                {group.user.email}
              </Text>
            </Flex>
          </Flex>

          <HStack>
            {group.cards.map((card) =>
              renderCard(card, group.user.uid === user.uid)
            )}
          </HStack>
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

      <HStack overflowX="scroll" overflowY="visible" p="4">
        {groupedAnswers.map((group, index) => renderAnswers(group, index))}
      </HStack>
    </Flex>
  );
}
