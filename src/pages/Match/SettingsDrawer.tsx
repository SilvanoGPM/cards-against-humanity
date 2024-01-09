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
  useToast,
} from '@chakra-ui/react';

import { forwardRef, useImperativeHandle } from 'react';

import { useBoolean } from '@/hooks/useBoolean';
import { getUserName } from '@/utils/get-user-name';
import { FaCopy, FaCrown } from 'react-icons/fa';
import { WhiteLogo } from '@/components/Card/Logos';
import { PixQRCode } from '@/components/pix-qrcode';

interface SettingsDrawerProps {
  match: MatchConvertedType;
}

export interface SettingsDrawerHandles {
  openDrawer: () => void;
}

function SettingsDrawerBase(
  { match }: SettingsDrawerProps,
  ref: React.ForwardedRef<SettingsDrawerHandles>
): JSX.Element {
  const [isOpen, openDrawer, closeDrawer] = useBoolean(false);
  const toast = useToast();

  useImperativeHandle(ref, () => ({
    openDrawer,
  }));

  function handleCopyMatchId(): void {
    navigator.clipboard.writeText(match.id);

    toast({
      title: 'Código copiado',
      description: 'O código da partida foi copiado com sucesso.',
      status: 'info',
    });
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
          <Flex w="full" flexDir="column" gap="9">
            <Flex flexDir="column" gap="4">
              <Heading as="h3" fontSize="2xl">
                Código da partida:
              </Heading>

              <Flex>
                <Input
                  readOnly
                  value={match.id}
                  borderColor="black"
                  roundedRight="0"
                />

                <Button
                  px="8"
                  roundedLeft="0"
                  rightIcon={<Icon as={FaCopy} />}
                  onClick={handleCopyMatchId}
                >
                  Copiar
                </Button>
              </Flex>
            </Flex>

            <Flex flexDir="column" gap="4">
              <Heading as="h3" fontSize="2xl">
                Jogadores:
              </Heading>

              <SimpleGrid
                pos="relative"
                zIndex="1"
                w="full"
                maxW="full"
                spacing={4}
                minChildWidth="200px"
                alignItems="start"
              >
                {match.users
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

                          <Text fontSize="sm" mt="-1">
                            {user.email}
                          </Text>
                        </Flex>
                      </Center>
                    );
                  })}
              </SimpleGrid>
            </Flex>

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

  // return (
  //   <Drawer isOpen={isOpen} onClose={closeDrawer} title="Menu">
  //     <div className={styles.copyMatchIdWrapper}>
  //       <p style={{ color: Colors.GRAY1 }}>Envie o código para seus amigos:</p>

  //       <div className={styles.copyMatchId}>
  //         <input defaultValue={match.id} />
  //         <Button
  //           onClick={handleCopyMatchId}
  //           intent="primary"
  //           icon={<AiFillCopy />}
  //         />
  //       </div>
  //     </div>

  //     <UsersList match={match} />

  //     <div className={styles.aux}>
  //       <p style={{ color: Colors.GRAY1 }}>
  //         Deseja auxiliar no projeto? Considere me pagar um café 😊
  //       </p>

  //       <img alt="QRCode do Pix" src={qrCode} />
  //     </div>
  //   </Drawer>
  // );
}

export const SettingsDrawer = forwardRef<
  SettingsDrawerHandles,
  SettingsDrawerProps
>(SettingsDrawerBase);
