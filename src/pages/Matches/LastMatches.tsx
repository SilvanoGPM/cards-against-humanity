import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { finishAllMatches, newMatch } from '@/services/matches';

import {
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Flex,
  Heading,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  SimpleGrid,
  Text,
  useToast,
} from '@chakra-ui/react';

import { FaSearch, FaTimes } from 'react-icons/fa';
import { RxCardStackPlus } from 'react-icons/rx';

import { FinishMatchButton } from '@/components/finish-match-button';
import { ServerMaintanceError } from '@/lib/ServerMaintanceError';
import { getFirstString } from '@/utils/get-first-string';
import { getUserName } from '@/utils/get-user-name';
import { getErrorMessage } from '@/utils/get-error-message';

interface LastMatchesProps {
  matches: MatchConvertedType[];
  onMatchesChange: (matches: MatchConvertedType[]) => void;
}

export function LastMatches({
  matches,
  onMatchesChange,
}: LastMatchesProps): JSX.Element {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAdmin } = useAuth();

  const [finishingMatch, startFinishingMatch, stopFinishingMatch] =
    useBoolean(false);

  const [creatingMatch, startCreate, stopCreate] = useBoolean(false);

  async function handleNewMatch() {
    try {
      startCreate();

      const id = await newMatch(user.uid);

      navigate(`/match/${id}`);
    } catch (error) {
      console.error('error', error);

      if (error instanceof ServerMaintanceError) {
        toast({
          title: 'Servidor em manutenção',
          description: error.message,
          status: 'error',
        });

        return;
      }

      const description = getErrorMessage(
        error,
        'Não foi possível criar a partida'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      stopCreate();
    }
  }

  async function handleFinishAllMatches(): Promise<void> {
    try {
      startFinishingMatch();

      await finishAllMatches(matches);

      onMatchesChange([]);

      toast({
        title: 'Partidas finalizadas',
        description: 'Todas as partidas foram finalizadas!',
        status: 'success',
      });
    } catch (error) {
      console.error('error', error);

      toast({
        title: 'Aconteceu um erro',
        description: 'Não foi possível finalizar as partidas',
        status: 'error',
      });
    } finally {
      stopFinishingMatch();
    }
  }

  return (
    <Flex flexDir="column">
      {matches.length === 0 ? (
        <Center flexDir="column" gap="4" minH="60vh">
          <Icon as={FaSearch} fontSize="4xl" />

          <Box textAlign="center">
            <Heading as="h2" fontSize="2xl">
              Nenhuma partida rolando 😢
            </Heading>

            <Text color="gray.500">
              Inicie uma agora e jogue com seus amigos!
            </Text>
          </Box>

          <Button isLoading={creatingMatch} onClick={handleNewMatch}>
            Criar partida
          </Button>
        </Center>
      ) : (
        <>
          <Flex
            align="center"
            justify="space-between"
            gap="4"
            direction={{ base: 'column', md: 'row' }}
            mb="12"
          >
            <Heading as="h2" fontSize="2xl">
              Últimas partidas
            </Heading>

            {isAdmin && (
              <Popover>
                <PopoverTrigger>
                  <Button
                    leftIcon={<Icon as={FaTimes} />}
                    isLoading={finishingMatch}
                  >
                    Encerrar todas as partidas
                  </Button>
                </PopoverTrigger>

                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>Finalizar todas as partidas?</PopoverHeader>
                  <PopoverBody>
                    <Button
                      w="full"
                      variant="solid"
                      colorScheme="red"
                      onClick={handleFinishAllMatches}
                      isLoading={finishingMatch}
                    >
                      Sim, tenho certeza.
                    </Button>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            )}
          </Flex>

          <SimpleGrid
            pos="relative"
            zIndex="1"
            w="full"
            maxW="full"
            spacing={4}
            minChildWidth={{ base: '100%', md: '300px', lg: '250px' }}
            alignItems="center"
          >
            {matches.map(({ id, owner, rounds }) => (
              <Card
                h="190px"
                key={id}
                bg="white"
                shadow="2xl"
                p="4"
                rounded="md"
                border="1px"
                borderColor="black"
              >
                <Flex mb="4" gap="2">
                  <Avatar
                    bg="black"
                    color="white"
                    name={getUserName(owner)}
                    src={owner.photoURL!}
                  />

                  <Box>
                    <Text
                      fontWeight="bold"
                      overflow="hidden"
                      whiteSpace="nowrap"
                      textOverflow="ellipsis"
                      maxW={{ base: '150px', md: '400px', lg: '200px' }}
                    >
                      Dono: {getFirstString(owner.displayName)}
                    </Text>

                    <Text color="gray.600" fontSize="small">
                      Rounds: {rounds}
                    </Text>
                  </Box>
                </Flex>

                <Flex flexDir="column" gap="2" justify="center" flex="1">
                  <Button
                    leftIcon={
                      <Icon as={RxCardStackPlus} transform="auto" rotate="90" />
                    }
                    as={Link}
                    to={`/match/${id}`}
                    w="full"
                  >
                    Entrar na partida
                  </Button>

                  {(isAdmin || owner.uid === user.uid) && (
                    <FinishMatchButton
                      matchId={id}
                      afterFinish={(id) => {
                        const newMatches = matches.filter(
                          (match) => match.id !== id
                        );

                        onMatchesChange([...newMatches]);
                      }}
                    />
                  )}
                </Flex>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}
    </Flex>
  );
}
