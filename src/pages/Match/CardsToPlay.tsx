import { useCallback, useEffect, useRef, useState } from 'react';

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
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight, FaCheckCircle } from 'react-icons/fa';
import { getErrorMessage } from '@/utils/get-error-message';
import { useFetchDeck } from './useFetchDeck';

import styles from './styles.module.scss';

interface CardsToPlayProps {
  match: MatchConvertedType;
  isFirstTime: boolean;
  newCardIds: Set<string>;
}

export function CardsToPlay({
  match,
  isFirstTime,
  newCardIds,
}: CardsToPlayProps) {
  const { user } = useAuth();
  const toast = useToast();

  const { deck } = useFetchDeck(match, isFirstTime);

  const [selectedCardsId, setSelectedCardsId] = useState<string[]>([]);
  const [sending, setTrueSending, setFalseSending] = useBoolean(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();

    el.addEventListener('scroll', updateScrollButtons);
    const observer = new ResizeObserver(() => updateScrollButtons());
    observer.observe(el);

    // eslint-disable-next-line consistent-return
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      observer.disconnect();
    };
  }, [updateScrollButtons, deck]);

  function scroll(direction: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

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
      console.error('error', error);

      const description = getErrorMessage(
        error,
        'Não foi possível realizar jogada.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      setFalseSending();
    }
  }

  const newCardOrder = deck
    .filter((card) => newCardIds.has(card.id))
    .map((card) => card.id);

  function renderCard(card: CardType): JSX.Element {
    const isSelected = selectedCardsId.includes(card.id);
    const isNewCard = newCardIds.has(card.id);
    const newCardIndex = newCardOrder.indexOf(card.id);

    return (
      <Box key={card.id} onClick={selectCard(card.id)}>
        <Card
          {...card}
          animationType={isNewCard ? 'auto' : 'off'}
          animationDelay={isNewCard ? `${(newCardIndex + 2) * 500}ms` : '0ms'}
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
      <Flex align="center" gap="2">
        <IconButton
          aria-label="Scroll para esquerda"
          icon={<Icon as={FaChevronLeft} />}
          onClick={() => scroll('left')}
          variant="ghost"
          size="sm"
          height="280px"
          flexShrink={0}
          visibility={canScrollLeft ? 'visible' : 'hidden'}
        />

        <HStack
          ref={scrollRef}
          w="full"
          overflowX="auto"
          py="4"
          px="8"
          justifyContent={{
            base: 'start',
            md: deck.length >= 5 ? 'start' : 'center',
          }}
        >
          {deck.map(renderCard)}
        </HStack>

        <IconButton
          aria-label="Scroll para direita"
          icon={<Icon as={FaChevronRight} />}
          onClick={() => scroll('right')}
          variant="ghost"
          size="sm"
          height="280px"
          flexShrink={0}
          visibility={canScrollRight ? 'visible' : 'hidden'}
        />
      </Flex>

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
