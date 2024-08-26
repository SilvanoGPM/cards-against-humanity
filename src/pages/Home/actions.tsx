import { LoginButton } from '@/components/login-button';
import { useAuth } from '@/contexts/AuthContext';
import { useAds } from '@/hooks/use-ads';
import { useBoolean } from '@/hooks/useBoolean';
import { ServerMaintanceError } from '@/lib/ServerMaintanceError';
import { newMatch } from '@/services/matches';
import { getErrorMessage } from '@/utils/get-error-message';
import { Button, Icon, VStack, useToast } from '@chakra-ui/react';
import { FaYoutube } from 'react-icons/fa';
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

  const playAd = useAds(startCreate);

  function handleShowLoginInfo() {
    toast({
      title: 'Faça login',
      description: 'Para jogar é necessário realizar login',
      status: 'info',
    });
  }

  function handleNavigateWithoutLogin(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    if (!authenticated) {
      event.preventDefault();

      handleShowLoginInfo();
    }
  }

  async function handleNewMatch() {
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
  }

  return (
    <VStack flex="1">
      <Button
        onClick={handleNewMatch}
        isLoading={isCreating}
        leftIcon={<Icon as={RxCardStackPlus} transform="auto" rotate="90" />}
        w="full"
      >
        Nova partida
      </Button>

      <Button
        onClick={handleNavigateWithoutLogin}
        as={Link}
        to="/matches"
        isLoading={isCreating}
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
        isLoading={isCreating}
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
          isLoading={isCreating}
          leftIcon={<Icon as={RxCardStackPlus} transform="auto" rotate="90" />}
          w="full"
          variant="defaultOutlined"
        >
          Nova carta
        </Button>
      )}

      {isAdmin && (
        <Button
          onClick={playAd}
          leftIcon={<Icon as={FaYoutube} />}
          w="full"
          variant="defaultOutlined"
        >
          Mostrar Ad
        </Button>
      )}

      {authenticated ? (
        <Button
          isLoading={isCreating}
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
