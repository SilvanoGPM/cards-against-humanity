import { ChangeEvent, FormEvent, useRef, useState } from 'react';

import { Card } from '@/components/Card';
import { GoBack } from '@/components/GoBack';
import { CARD_TOKEN } from '@/constants/globals';
import { useBoolean } from '@/hooks/useBoolean';

import { newCard } from '@/services/cards';

import { Textarea } from '@/components/form/textarea';
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  useToast,
} from '@chakra-ui/react';

type CardSupportedTypes = 'WHITE' | 'BLACK';

const INITIAL_CARD = {
  message: '',
  type: 'WHITE' as CardSupportedTypes,
};

export function NewCard(): JSX.Element {
  const toast = useToast();

  const [card, setCard] = useState<Omit<CardType, 'id'>>(INITIAL_CARD);
  const [creating, startCreating, stopCreating] = useBoolean(false);

  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();

    const { message, type } = event.target as typeof event.target & {
      message: { value: string };
      type: { value: string };
    };

    setCard({ message: message.value, type: type.value as CardSupportedTypes });
  }

  function handleMessageChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const { value } = event.target;

    setCard({ ...card, message: value });
  }

  async function handleNewCard(): Promise<void> {
    if (card && card.message && card.type) {
      try {
        startCreating();

        const cardToCreate: CardToCreate = card.message.includes(CARD_TOKEN)
          ? { type: 'BLACK', message: card.message }
          : card;

        await newCard(cardToCreate);

        toast({
          title: 'Carta adicionada',
          description: 'A carta foi adicionada com sucesso!',
          status: 'success',
        });

        formRef.current?.reset();
        messageRef.current?.focus();
        setCard(INITIAL_CARD);
      } catch (error) {
        console.error('error', error);

        toast({
          title: 'Aconteceu um erro',
          description: 'Não foi possível adicionar carta.',
          status: 'error',
        });
      } finally {
        stopCreating();
      }
      return;
    }

    toast({
      title: 'Carta inválida',
      description: 'Insira uma mensagem para a carta.',
      status: 'info',
    });
  }

  return (
    <Container
      as={Flex}
      py="16"
      maxW="1100px"
      gap={{ base: '4', md: '0' }}
      flexDir={{ base: 'column', md: 'row' }}
    >
      <Box pos="absolute" top="4" left="4">
        <GoBack />
      </Box>

      <Flex
        as="form"
        flex="1"
        flexDir="column"
        gap="4"
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <Textarea
          ref={messageRef}
          name="message"
          label="Texto da carta:"
          placeholder="Ex: O que é necessário para conquistar uma mulher?"
          hint={
            card.type === 'BLACK'
              ? `Utilize o símbolo ${CARD_TOKEN} para adicionar uma linha de pergunta, isso vai determinar quantas perguntas a carta tem, caso contrário, vai ter apenas uma pergunta.`
              : ''
          }
          onChange={handleMessageChange}
        />

        <Center flexDir={{ base: 'column', md: 'row' }} w="full">
          <Button
            w="full"
            boxShadow="0 .2em black !important"
            roundedRight={{ base: 'md', md: '0' }}
            variant={card.type === 'WHITE' ? 'default' : 'defaultOutlined'}
            onClick={() => setCard({ ...card, type: 'WHITE' })}
          >
            Resposta
          </Button>

          <Button
            w="full"
            boxShadow="0 .2em black !important"
            roundedLeft={{ base: 'md', md: '0' }}
            variant={card.type === 'BLACK' ? 'default' : 'defaultOutlined'}
            onClick={() => setCard({ ...card, type: 'BLACK' })}
          >
            Pergunta
          </Button>
        </Center>

        <Button type="submit" onClick={handleNewCard} isLoading={creating}>
          Criar carta
        </Button>
      </Flex>

      <Center flex="1" flexDir="column">
        <Heading as="h3" fontSize="xl">
          Preview da carta
        </Heading>

        <Card {...card} />
      </Center>
    </Container>
  );
}
