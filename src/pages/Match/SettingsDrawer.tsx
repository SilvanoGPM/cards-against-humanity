import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Icon,
  Input,
  SimpleGrid,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';

import { forwardRef, useImperativeHandle, useRef } from 'react';

import { WhiteLogo } from '@/components/Card/Logos';
import { FinishMatchButton } from '@/components/finish-match-button';
import { PixQRCode } from '@/components/pix-qrcode';
import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { addMessageToMatch } from '@/services/matches';
import { getErrorMessage } from '@/utils/get-error-message';
import { getUserName } from '@/utils/get-user-name';
import { FaCrown } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import { MatchLinkInput } from './match-link-input';

interface SettingsDrawerProps {
  match: MatchConvertedType | null;
}

export interface SettingsDrawerHandles {
  openDrawer: () => void;
}

function SettingsDrawerBase(
  { match }: SettingsDrawerProps,
  ref: React.ForwardedRef<SettingsDrawerHandles>
): JSX.Element {
  const [isOpen, openDrawer, closeDrawer] = useBoolean(false);

  const [isSendingMessage, startSendingMessage, stopSendingMessage] =
    useBoolean(false);

  const toast = useToast();
  const { user } = useAuth();

  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    openDrawer,
  }));

  async function handleSendMessage() {
    const message = inputRef.current?.value.trim();

    if (!message || message.length < 3 || !match) {
      toast({
        title: 'Mensagem muito curta',
        description: 'Insira uma mensagem de pelo menos 3 caracteres.',
        status: 'info',
      });

      return;
    }

    try {
      startSendingMessage();

      await addMessageToMatch(match.id, {
        message,
        userName: getUserName(user),
        userAvatar: user.photoURL || undefined,
      });

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('error', error);

      const description = getErrorMessage(
        error,
        'Não foi possível enviar mensagem.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      stopSendingMessage();
    }
  }

  return (
    <Drawer isOpen={isOpen} placement="right" size="lg" onClose={closeDrawer}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Box w="200px">
            <WhiteLogo />
          </Box>
        </DrawerHeader>

        <DrawerBody>
          <Flex w="full" flexDir="column" gap="8">
            <Flex flexDir="column" gap="4">
              <Heading as="h3" fontSize="2xl">
                Link da partida:
              </Heading>

              <MatchLinkInput />
            </Flex>

            <Flex flexDir="column" gap="4">
              <Heading as="h3" fontSize="2xl">
                Chat:
              </Heading>

              <VStack
                maxH="300px"
                shadow="2xl"
                h="300px"
                border="1px"
                spacing="0"
                borderColor="black"
                rounded="md"
                mb="2"
                p="4"
                overflowY="scroll"
              >
                {match?.messages
                  .sort((a, b) => {
                    return a.createdAt.toMillis() - b.createdAt.toMillis();
                  })
                  .map((message) => ({
                    ...message,
                    createdAt: message.createdAt.toDate() as Date,
                  }))
                  ?.map((message) => {
                    const hours = String(message.createdAt.getHours()).padStart(
                      2,
                      '0'
                    );

                    const minutes = message.createdAt.getMinutes();

                    return (
                      <Flex key={message.id} w="full" align="start">
                        <Text
                          color="gray.600"
                          wordBreak="break-word"
                          textAlign="start"
                        >
                          <Text as="span" fontSize="x-small">
                            {hours}:{minutes}
                          </Text>{' '}
                          <Text as="span" fontWeight="bold" color="black">
                            {message.userName}:
                          </Text>{' '}
                          {message.message}
                        </Text>
                      </Flex>
                    );
                  })}
              </VStack>

              <Flex>
                <Input
                  ref={inputRef}
                  placeholder="Insira sua mensagem..."
                  borderColor="black"
                  roundedRight="0"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />

                <Button
                  px="8"
                  roundedLeft="0"
                  rightIcon={<Icon as={FiSend} transform="auto" rotate="45" />}
                  onClick={handleSendMessage}
                  isLoading={isSendingMessage}
                >
                  Enviar
                </Button>
              </Flex>
            </Flex>

            <Flex flexDir="column" gap="4">
              <Flex flexDir="column" gap="1">
                <Heading as="h3" fontSize="2xl">
                  Jogadores:
                </Heading>

                <Text fontSize="sm" color="gray.500">
                  Ganha quem fizer {match?.pointsToWin || 0} pontos
                </Text>
              </Flex>

              <SimpleGrid
                pos="relative"
                zIndex="1"
                w="full"
                maxW="full"
                spacing={4}
                minChildWidth="200px"
                alignItems="start"
              >
                {match?.users
                  .sort((a) => {
                    if (a.uid === match.owner.uid) {
                      return -1;
                    }

                    return 1;
                  })
                  .map((user) => {
                    const isOwner = user.uid === match.owner.uid;

                    const userName = getUserName(user);

                    return (
                      <Center
                        gap="2"
                        key={user.uid}
                        flexDir="column"
                        bg="white"
                        shadow="2xl"
                        p="4"
                        rounded="md"
                        border="1px"
                        borderColor="black"
                        textAlign="center"
                      >
                        <Avatar
                          bg="black"
                          color="white"
                          size="lg"
                          name={userName}
                          src={user.photoURL!}
                        >
                          {isOwner && (
                            <AvatarBadge
                              boxSize="1.25em"
                              border="0"
                              bottom="none"
                              right="none"
                              top="-24px"
                              left="8px"
                            >
                              <Icon as={FaCrown} color="yellow.600" />
                            </AvatarBadge>
                          )}
                        </Avatar>

                        <Flex direction="column" color="secondary">
                          <Text fontWeight="bold">{userName}</Text>

                          <Text fontSize="sm" mt="-1" color="gray.500">
                            Pontos:{' '}
                            {match?.points.find(
                              (point) => point.userId === user.uid
                            )?.value || 0}
                          </Text>
                        </Flex>
                      </Center>
                    );
                  })}
              </SimpleGrid>
            </Flex>

            <FinishMatchButton matchId={match?.id || ''} />

            <Flex flexDir="column" textAlign="center">
              <Heading as="h3" fontSize="2xl">
                Doações:
              </Heading>

              <Text color="gray.500">
                Deseja auxiliar no projeto? Considere me pagar um café 😊
              </Text>

              <PixQRCode copyMessage="show" maxW="300px" />
            </Flex>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export const SettingsDrawer = forwardRef<
  SettingsDrawerHandles,
  SettingsDrawerProps
>(SettingsDrawerBase);
