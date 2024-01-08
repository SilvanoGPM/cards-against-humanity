import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { FiSend } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export function JoinMatch() {
  const { authenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  function handleMatchJoin() {
    if (!authenticated) {
      toast({
        title: 'Faça login',
        description: 'Para jogar é necessário realizar login',
        status: 'info',
      });

      return;
    }

    const code = inputRef.current?.value.trim();

    if (!code || code.length !== 20) {
      toast({
        title: 'Código inválido',
        status: 'info',
        description: 'Insira um código de partida válido.',
      });

      return;
    }

    navigate(`/match/${code}`);
  }

  return (
    <>
      <Box>
        <Heading as="h1" fontSize="2xl">
          Entre em uma partida
        </Heading>

        <Text color="gray.600" fontSize="small">
          Peça para seu amigo enviar o código da partida para que você possa
          entrar na partida.
        </Text>
      </Box>

      <Flex>
        <Input
          ref={inputRef}
          placeholder="Código da partida"
          borderColor="black"
          roundedRight="0"
        />

        <Button
          px="8"
          roundedLeft="0"
          rightIcon={<Icon as={FiSend} transform="auto" rotate="45" />}
          onClick={handleMatchJoin}
        >
          Entrar
        </Button>
      </Flex>
    </>
  );
}
