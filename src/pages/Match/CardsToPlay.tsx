import { useState } from 'react';

import { Card } from '@/components/Card';
import { CARD_TOKEN } from '@/constants/globals';
import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { setAnswerToActiveRound } from '@/services/matches';
import { countString } from '@/utils/count-string';

import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { useFetchDeck } from './useFetchDeck';

import styles from './styles.module.scss';

interface CardsToPlayProps {
  match: MatchConvertedType;
  isFirstTime: boolean;
}

export function CardsToPlay({ match, isFirstTime }: CardsToPlayProps) {
  const { user } = useAuth();
  const toast = useToast();

  const { deck } = useFetchDeck(match, isFirstTime);

  const [selectedCardsId, setSelectedCardsId] = useState<string[]>([]);
  const [sending, setTrueSending, setFalseSending] = useBoolean(false);

  const { question } = match.actualRound!;

  const totalOfPlays = countString(question.message, CARD_TOKEN) || 1;

  function selectCard(cardId: string): () => void {
    return () => {
      if (selectedCardsId.includes(cardId)) {
        const newSelectedCardsId = selectedCardsId.filter(
          (id) => cardId !== id
        );

        setSelectedCardsId(newSelectedCardsId);
        return;
      }

      if (selectedCardsId.length === totalOfPlays) {
        const [, ...otherCardsId] = selectedCardsId;

        setSelectedCardsId([...otherCardsId, cardId]);

        return;
      }

      setSelectedCardsId([...selectedCardsId, cardId]);
    };
  }

  async function confirmPlay(): Promise<void> {
    try {
      if (selectedCardsId.length !== totalOfPlays) {
        toast({
          title: 'Escolha as cartas',
          description: `Selecione ${totalOfPlays} cartas para jogar!`,
          status: 'info',
        });

        return;
      }

      setTrueSending();

      const containsSomeCard = match.actualRound?.answers.find(
        (lastAwnser) =>
          selectedCardsId.some((awnser) => awnser === lastAwnser.card.id) &&
          user.uid === lastAwnser.user.uid
      );

      if (containsSomeCard) {
        toast({
          title: 'Carta já adicionada',
          description: `Você já adicionou essa carta!`,
          status: 'info',
        });

        return;
      }

      const data = {
        user: user.uid,
        awnsers: selectedCardsId,
      };

      await setAnswerToActiveRound(match.id, data);

      setSelectedCardsId([]);
    } catch (error) {
      console.log('error', error);

      toast({
        title: 'Aconteceu um erro',
        description: 'Não foi possível realizar jogada',
        status: 'error',
      });
    } finally {
      setFalseSending();
    }
  }

  function renderCard(card: CardType, index: number): JSX.Element {
    const isSelected = selectedCardsId.includes(card.id);

    return (
      <Box key={card.id} onClick={selectCard(card.id)}>
        <Card
          {...card}
          animationType="auto"
          animationDelay={`${(index + 2) * 500}ms`}
          className={`${styles.card} ${isSelected ? styles.isSelected : ''}`}
          frontClassName={styles.cardFront}
          backClassName={`${styles.cardBack} ${
            isSelected ? styles.isSelected : ''
          }`}
          messageClassName={styles.cardText}
        />
      </Box>
    );
  }

  if (match.rounds === 0) {
    return null;
  }

  return (
    <Flex w="full" flexDir="column" gap="8">
      <HStack justify={{ base: 'start', md: 'center' }} overflowX="auto" py="4">
        {deck.map(renderCard)}
      </HStack>

      {isFirstTime && (
        <Heading as="h3" fontSize="xl" textAlign="center">
          Você joga na próxima rodada...
        </Heading>
      )}

      <Center>
        <Button
          w="full"
          maxW="500px"
          leftIcon={<Icon as={FaCheckCircle} />}
          isLoading={sending}
          onClick={confirmPlay}
          transform="auto"
          scale={selectedCardsId.length === totalOfPlays ? '1' : '0'}
        >
          Confirmar
        </Button>
      </Center>
    </Flex>
  );
}
