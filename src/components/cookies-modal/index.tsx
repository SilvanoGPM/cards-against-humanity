import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import { Text } from '@blueprintjs/core';
import { Button, Flex, Heading, Icon } from '@chakra-ui/react';

import { LuCookie } from 'react-icons/lu';

export function CookiesModal() {
  const { authenticated } = useAuth();

  const [isOpen, setIsOpen, isLoading] = useStorage(
    '@CARDS_AGAINST_HUMANITY/ACCEPT_COOKIES',
    true
  );

  function handleAcceptCookies() {
    setIsOpen(false);
  }

  if (!isOpen || isLoading || !authenticated) {
    return null;
  }

  return (
    <Flex
      maxW={{ base: '280px', sm: '350px', md: '500px', lg: '1100px' }}
      w="full"
      mx={{ base: '0', lg: '4' }}
      rounded="md"
      p="4"
      gap="4"
      pos="fixed"
      bottom="4"
      left="50%"
      transform="auto"
      translateX="-50%"
      direction="column"
      zIndex="100"
      shadow="dark-lg"
      bg="white"
    >
      <Flex>
        <Flex align="center" gap="1">
          <Icon as={LuCookie} />
          <Heading as="h2" fontSize="xl">
            Esse site usa cookies
          </Heading>
        </Flex>
      </Flex>

      <Flex>
        <Text color="gray.600">
          Bem-vindo ao nosso site! Para proporcionar a melhor experiência
          possível, utilizamos cookies. Ao continuar navegando, você concorda
          com o uso desses cookies. Eles são essenciais para o funcionamento do
          site e para entendermos como você o utiliza. Caso prefira, você pode
          ajustar as configurações do seu navegador para gerenciar ou recusar os
          cookies. Obrigado por escolher nossa plataforma!
        </Text>
      </Flex>

      <Flex>
        <Button w="full" onClick={handleAcceptCookies}>
          Confirmar
        </Button>
      </Flex>
    </Flex>
  );
}
