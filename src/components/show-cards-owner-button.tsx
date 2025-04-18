import { useBoolean } from '@/hooks/useBoolean';
import { setShouldShowCardOwner } from '@/services/matches';

import { Button, ButtonProps, Icon, useToast } from '@chakra-ui/react';

import { FaUser } from 'react-icons/fa';

interface ShowCardsOwnerButtonProps extends ButtonProps {
  matchId: string;
}

export function ShowCardsOwnerButton({
  matchId,
  ...props
}: ShowCardsOwnerButtonProps) {
  const toast = useToast();

  const [loading, startLoading, stopLoading] = useBoolean(false);

  async function handleShowCards() {
    try {
      startLoading();

      await setShouldShowCardOwner(matchId, true);
    } catch (error) {
      console.error('error', error);

      toast({
        title: 'Aconteceu um erro',
        description: 'Não foi possível mostrar cartas, tente novamente',
        status: 'error',
      });
    } finally {
      stopLoading();
    }
  }

  return (
    <Button
      variant="defaultOutlined"
      fontSize="sm"
      leftIcon={<Icon as={FaUser} />}
      isLoading={loading}
      onClick={handleShowCards}
      {...props}
    >
      Mostrar donos das cartas
    </Button>
  );
}
