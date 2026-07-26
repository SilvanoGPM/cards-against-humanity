import { useRef, useState } from 'react';

import { Card } from '@/components/Card';

import { GoBack } from '@/components/GoBack';
import { SomeLoading } from '@/components/SomeLoading';

import { AddCardModal } from '@/components/add-card-modal';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  Input,
  Text,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { useFetchCards } from './useFetchCards';

type CardFilter = 'ALL' | 'WHITE' | 'BLACK';

export function Cards(): JSX.Element {
  const { isLoading, cards } = useFetchCards();

  const [cardsFilter, setCardsFilter] = useState<CardFilter>('ALL');
  const [cardsSearch, setCardsSearch] = useState('');

  const [params] = useSearchParams();

  const [addCardModalIsOpen, setAddCardModalIsOpen] = useState(
    params.get('add') !== null
  );

  const inputRef = useRef<HTMLInputElement>(null);

  function filterCardsByType(type: Omit<CardFilter, 'ALL'>) {
    return (card: CardType) =>
      type === card.type && card.message.toLowerCase().includes(cardsSearch);
  }

  const whites = cards.filter(filterCardsByType('WHITE'));
  const blacks = cards.filter(filterCardsByType('BLACK'));

  function handleFilterCards() {
    const search = inputRef.current?.value.trim().toLowerCase();

    setCardsSearch(search || '');
  }

  return (
    <Flex flexDir="column" pt="16">
      <SomeLoading loading={isLoading} message="Carregando cartas..." />

      <Box pos="absolute" top="4" left="4">
        <GoBack />
      </Box>

      <Heading as="h1" fontSize="3xl" textAlign="center">
        Cartas:
      </Heading>

      <Center w="full" flexDir="column" gap="4" mt="8" px="4">
        <Flex w="full" maxW={{ base: 'full', md: '600px' }}>
          <Input
            placeholder="Texto da carta..."
            borderColor="black"
            roundedRight="0"
            ref={inputRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleFilterCards();
              }
            }}
          />

          <Button
            px="8"
            roundedLeft="0"
            minW={{ base: 'auto', md: '200px' }}
            rightIcon={<Icon as={FiSearch} />}
            onClick={handleFilterCards}
          >
            Pesquisar
          </Button>
        </Flex>

        <Center flexDir={{ base: 'column', md: 'row' }} w="full">
          <Button
            boxShadow="0 .2em black !important"
            roundedRight={{ base: 'md', md: '0' }}
            roundedBottomLeft={{ base: '0', md: 'md' }}
            roundedBottomRight="0"
            w={{ base: '100%', md: '200px' }}
            variant={cardsFilter === 'ALL' ? 'default' : 'defaultOutlined'}
            onClick={() => setCardsFilter('ALL')}
          >
            Todas
          </Button>

          <Button
            boxShadow="0 .2em black !important"
            rounded="0"
            w={{ base: '100%', md: '200px' }}
            variant={cardsFilter === 'WHITE' ? 'default' : 'defaultOutlined'}
            onClick={() => setCardsFilter('WHITE')}
          >
            Respostas
          </Button>

          <Button
            boxShadow="0 .2em black !important"
            roundedLeft={{ base: 'md', md: '0' }}
            roundedTopRight={{ base: '0', md: 'md' }}
            roundedTopLeft="0"
            w={{ base: '100%', md: '200px' }}
            variant={cardsFilter === 'BLACK' ? 'default' : 'defaultOutlined'}
            onClick={() => setCardsFilter('BLACK')}
          >
            Perguntas
          </Button>
        </Center>
      </Center>

      <Text
        my="4"
        color="blue.500"
        cursor="pointer"
        textDecor="underline"
        textAlign="center"
        onClick={() => setAddCardModalIsOpen(true)}
      >
        Deseja adicionar uma carta? Clique aqui para saber como.
      </Text>

      <AddCardModal
        onClose={() => setAddCardModalIsOpen(false)}
        isOpen={addCardModalIsOpen}
      />

      <Flex gap="2" flexDir="column">
        {cardsFilter !== 'BLACK' && (
          <Center gap="2" flexWrap="wrap" bg="white" mt="8" p="4">
            <Text color="black" w="full" textAlign="center">
              Total de respostas: {whites.length}
            </Text>

            {whites.map(({ id, message, type }, index) => (
              <Card
                key={id}
                message={message}
                type={type}
                animationType="auto"
                animationDelay={`${index >= 20 ? 0 : index * 500}ms`}
              />
            ))}
          </Center>
        )}

        {cardsFilter !== 'WHITE' && (
          <Center gap="2" flexWrap="wrap" bg="black" mt="8" p="4">
            <Text color="white" w="full" textAlign="center">
              Total de perguntas: {blacks.length}
            </Text>

            {blacks.map(({ id, message, type }) => (
              <Card key={id} message={message} type={type} />
            ))}
          </Center>
        )}
      </Flex>
    </Flex>
  );
}
