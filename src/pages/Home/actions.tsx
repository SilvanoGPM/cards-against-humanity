import { LoginButton } from '@/components/login-button';
import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { ServerMaintanceError } from '@/lib/ServerMaintanceError';
import { newMatch } from '@/services/matches';
import { getErrorMessage } from '@/utils/get-error-message';
import {
  Button,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import { MdExitToApp } from 'react-icons/md';
import { RiPhoneFindFill } from 'react-icons/ri';
import { RxCardStackPlus } from 'react-icons/rx';
import { TbCards } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';

export function Actions() {
  const { isAdmin, user, handleLogout, authenticated } = useAuth();

  const navigate = useNavigate();
  const toast = useToast();

  const [isCreating, startCreate, stopCreate] = useBoolean(false);

  const handleShowLoginInfo = useCallback(() => {
    toast({
      title: 'Faça login',
      description: 'Para jogar é necessário realizar login',
      status: 'info',
    });
  }, [toast]);

  function handleNavigateWithoutLogin(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    if (!authenticated) {
      event.preventDefault();

      handleShowLoginInfo();
    }
  }

  const handleNewMatch = useCallback(async () => {
    if (!authenticated) {
      handleShowLoginInfo();
      return;
    }

    try {
      startCreate();

      const id = await newMatch(user.uid);

      navigate(`/match/${id}`);
    } catch (error) {
      console.error('error', error);

      if (error instanceof ServerMaintanceError) {
        toast({
          title: 'Limite alcançado',
          description: error.message,
          status: 'error',
        });

        return;
      }

      const description = getErrorMessage(
        error,
        'Não foi possível criar a partida.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });
    } finally {
      stopCreate();
    }
  }, [
    authenticated,
    navigate,
    startCreate,
    stopCreate,
    toast,
    user,
    handleShowLoginInfo,
  ]);

  const isLoading = isCreating;

  return (
    <VStack flex="1">
      <Button
        onClick={handleNewMatch}
        isLoading={isLoading}
        leftIcon={<Icon as={RxCardStackPlus} transform="auto" rotate="90" />}
        w="full"
      >
        Nova partida
      </Button>

      <Button
        onClick={handleNavigateWithoutLogin}
        as={Link}
        to="/matches"
        isLoading={isLoading}
        leftIcon={<Icon as={RiPhoneFindFill} />}
        w="full"
        variant="defaultOutlined"
      >
        Encontrar partidas
      </Button>

      <Button
        onClick={handleNavigateWithoutLogin}
        as={Link}
        to="/cards"
        isLoading={isLoading}
        leftIcon={<Icon as={TbCards} />}
        w="full"
        variant="defaultOutlined"
      >
        Ver cartas
      </Button>

      {isAdmin && (
        <Button
          as={Link}
          to="/new-card"
          isLoading={isLoading}
          leftIcon={<Icon as={RxCardStackPlus} transform="auto" rotate="90" />}
          w="full"
          variant="defaultOutlined"
        >
          Nova carta
        </Button>
      )}

      <Popover>
        <PopoverTrigger>
          <Button
            isLoading={isLoading}
            leftIcon={<Icon as={FaEllipsisH} />}
            w="full"
            variant="defaultOutlined"
          >
            Mais opções
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Mais informações sobre o jogo</PopoverHeader>
          <PopoverBody display="flex" flexDirection="column" gap="0.5rem">
            <Button
              as="a"
              href="/sobre.html"
              isLoading={isLoading}
              w="full"
              variant="defaultOutlined"
            >
              Sobre o jogo
            </Button>

            <Button
              as="a"
              href="/tutorial.html"
              isLoading={isLoading}
              w="full"
              variant="defaultOutlined"
            >
              Tutorial
            </Button>

            <Button
              as="a"
              href="/faq.html"
              isLoading={isLoading}
              w="full"
              variant="defaultOutlined"
            >
              Perguntas frequentes
            </Button>

            <Button
              as="a"
              href="/atualizacoes.html"
              isLoading={isLoading}
              w="full"
              variant="defaultOutlined"
            >
              Atualizações
            </Button>

            <Button
              as="a"
              href="/doacoes.html"
              isLoading={isLoading}
              w="full"
              variant="defaultOutlined"
            >
              Doações
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>

      {authenticated ? (
        <Button
          isLoading={isLoading}
          onClick={handleLogout}
          leftIcon={<Icon as={MdExitToApp} />}
          w="full"
          variant="defaultOutlined"
        >
          Sair
        </Button>
      ) : (
        <LoginButton w="full" />
      )}
    </VStack>
  );
}
