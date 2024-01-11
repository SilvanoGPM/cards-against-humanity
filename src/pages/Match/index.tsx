import { useRef } from 'react';
import { useParams } from 'react-router-dom';

import { Card } from '@/components/Card';
import { GoBack } from '@/components/GoBack';
import { SomeLoading } from '@/components/SomeLoading';
import { useAuth } from '@/contexts/AuthContext';
import { finishMatch } from '@/services/matches';
import { getFirstString } from '@/utils/get-first-string';

import { FinishMatchButton } from '@/components/finish-match-button';
import { getUserName } from '@/utils/get-user-name';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Icon,
  IconButton,
  Tag,
  Text,
} from '@chakra-ui/react';
import { FaArrowRight, FaBars, FaFlag, FaPlay } from 'react-icons/fa';
import { CardsPlayedList } from './CardsPlayedList';
import { CardsToPlay } from './CardsToPlay';
import { SettingsDrawer } from './SettingsDrawer';
import { UsersListHandles } from './UsersList';
import { useSetupMatch } from './useSetupMatch';

import { useDisableMatch } from './useDisableMatch';
import { MatchIdInput } from './match-id-input';

export function Match() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const {
    isLoading,
    match,
    nextRound,
    loadingNext,
    isFirstTime,
    hasNewMessages,
    setHasNewMessases,
  } = useSetupMatch(id);

  const menuRef = useRef<UsersListHandles>(null);

  const round = match?.rounds || 0;
  const isOwner = match?.owner?.uid === user?.uid;

  const matchStarted = round > 0 && !isLoading && match;

  const userAlreadyPlayed = match?.actualRound?.usersWhoPlayed.find(
    (otherUser) => otherUser.user.uid === user?.uid
  );

  function handleOpenDrawer(): void {
    setHasNewMessases(false);
    menuRef.current?.openDrawer();
  }

  useDisableMatch(id, isOwner);

  return (
    <>
      <Container maxW="1100px" p="8">
        <SomeLoading
          loading={isLoading || loadingNext}
          message={isLoading ? 'Carregando partida...' : 'Carregando rodada...'}
        />

        {!isLoading && !loadingNext && (
          <>
            {matchStarted && (
              <Center w="full" mt="16">
                <Card
                  {...match!.actualRound!.question}
                  animationDelay={loadingNext ? '0s' : '0.5s'}
                  animationType={loadingNext ? 'revert' : 'auto'}
                />
              </Center>
            )}

            <Box
              pos="absolute"
              top="4"
              left="4"
              onClick={isOwner ? () => finishMatch(id!) : undefined}
            >
              <GoBack />
            </Box>

            {matchStarted && !userAlreadyPlayed && (
              <CardsToPlay match={match!} isFirstTime={isFirstTime} />
            )}

            {matchStarted && <CardsPlayedList match={match!} />}

            <SettingsDrawer ref={menuRef} match={match!} />

            <Flex gap="2" pos="fixed" top="4" right="4">
              <AvatarGroup
                size="sm"
                max={4}
                display={{ base: 'none', md: 'flex' }}
              >
                {match?.users?.map((user) => {
                  const name = getUserName(user);

                  return (
                    <Avatar
                      bg="black"
                      color="white"
                      key={user.uid}
                      title={name}
                      name={name}
                      src={user.photoURL!}
                    />
                  );
                })}
              </AvatarGroup>

              <Box pos="relative">
                <IconButton
                  aria-label="Abrir menu"
                  onClick={handleOpenDrawer}
                  icon={<Icon as={FaBars} />}
                />

                <Box
                  boxSize="10px"
                  rounded="full"
                  bg="red.500"
                  pos="absolute"
                  top="-1"
                  right="-1"
                  transform="auto"
                  transition="0.2s ease-in-out"
                  scale={hasNewMessages ? '1' : '0'}
                />
              </Box>
            </Flex>

            {matchStarted && (
              <Tag
                bg="black"
                color="white"
                w="fit-content"
                pos="absolute"
                top="6"
                left="16"
              >
                <Icon as={FaFlag} mr="2" /> {round}° Rodada
              </Tag>
            )}

            {!matchStarted && match && (
              <Center w="full" mt="16">
                <Box
                  as={Card}
                  message={
                    isOwner
                      ? 'Inicie a partida a qualquer momento.'
                      : `Esperando <strong>${getFirstString(
                          match!.owner.displayName
                        )}</strong> iniciar a partida!`
                  }
                  type="WHITE"
                  animationType="rotating"
                  animationDelay="0s"
                  w="250px"
                  h="300px"
                />
              </Center>
            )}

            {isOwner && (
              <Flex
                gap="4"
                justify={matchStarted ? 'end' : 'center'}
                mt={matchStarted ? '8' : '16'}
                align="center"
                wrap="wrap"
              >
                {matchStarted && (
                  <FinishMatchButton
                    matchId={id || ''}
                    w={{ base: 'full', sm: 'auto' }}
                  />
                )}

                <Button
                  w={{ base: 'full', sm: 'auto' }}
                  onClick={nextRound}
                  isLoading={loadingNext}
                  rightIcon={<Icon as={matchStarted ? FaArrowRight : FaPlay} />}
                >
                  {matchStarted ? 'Próximo round' : 'Iniciar partida'}
                </Button>
              </Flex>
            )}
          </>
        )}
      </Container>

      {!matchStarted && (
        <Center
          flexDir="column"
          pos="fixed"
          bottom="8"
          left="50%"
          transform="auto"
          translateX="-50%"
        >
          <Text mb="2" fontWeight="bold" fontSize="xl">
            Código da partida:
          </Text>
          <MatchIdInput id={match?.id} />
        </Center>
      )}
    </>
  );
}
