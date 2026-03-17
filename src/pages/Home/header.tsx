import { WhiteLogo } from '@/components/Card/Logos';
import { useAuth } from '@/contexts/AuthContext';

import { MdExitToApp } from 'react-icons/md';

import { getUserName } from '@/utils/get-user-name';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Icon,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';

import { LoginButton } from '@/components/login-button';
import avatar from '../../assets/avatar.png';

export function Header(): JSX.Element {
  const { user, handleLogout, authenticated } = useAuth();

  const userName = getUserName(user);

  return (
    <Flex align="center" justify="space-between" h="80px">
      <Box w={{ base: '120px', sm: '200px' }}>
        <WhiteLogo />
      </Box>

      {authenticated ? (
        <Flex align="center" gap="2">
          <Flex
            gap="0"
            direction="column"
            textAlign="end"
            display={{ base: 'none', md: 'flex' }}
          >
            <Text fontWeight="bold">{userName}</Text>
            <Text fontSize="xx-small" color="gray.500">
              {user.email}
            </Text>
          </Flex>

          <Popover lazyBehavior="keepMounted" isLazy placement="bottom-start">
            <>
              <PopoverTrigger>
                <Avatar
                  cursor="pointer"
                  bg="black"
                  color="white"
                  src={user.photoURL || avatar}
                  name={userName}
                />
              </PopoverTrigger>

              <PopoverContent>
                <PopoverHeader>
                  <Flex gap="2">
                    <Avatar
                      bg="black"
                      color="white"
                      size="sm"
                      name={userName}
                      src={user.photoURL || avatar}
                    />

                    <Flex direction="column" color="secondary">
                      <Text fontWeight="bold">{userName}</Text>

                      <Text fontSize="sm" mt="-1">
                        {user.email}
                      </Text>
                    </Flex>
                  </Flex>
                </PopoverHeader>

                <PopoverBody>
                  <Flex direction="column" align="start" gap="2" w="full">
                    <Button
                      w="full"
                      size="sm"
                      leftIcon={<Icon as={MdExitToApp} />}
                      variant="solid"
                      colorScheme="red"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </>
          </Popover>
        </Flex>
      ) : (
        <LoginButton size="sm" fontSize={{ base: 'xx-small', sm: 'small' }} />
      )}
    </Flex>
  );
}
