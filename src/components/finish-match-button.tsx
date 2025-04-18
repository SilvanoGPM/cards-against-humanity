import { useBoolean } from '@/hooks/useBoolean';
import { finishMatch } from '@/services/matches';

import {
  Button,
  ButtonProps,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useToast,
} from '@chakra-ui/react';

import { FaTimes } from 'react-icons/fa';

interface FinishMatchButtonProps extends ButtonProps {
  matchId: string;
  afterFinish?: (id: string) => void;
}

export function FinishMatchButton({
  matchId,
  afterFinish,
  ...props
}: FinishMatchButtonProps) {
  const toast = useToast();

  const [finishingMatch, startFinishingMatch, stopFinishingMatch] =
    useBoolean(false);

  async function handleFinishMatch() {
    try {
      startFinishingMatch();

      await finishMatch(matchId);

      afterFinish?.(matchId);

      toast({
        title: 'Partida finalizada',
        description: 'A partida foi finalizada com sucesso!',
        status: 'success',
      });
    } catch (error) {
      console.error('error', error);

      toast({
        title: 'Aconteceu um erro',
        description: 'Não foi possível finalizar a partida',
        status: 'error',
      });
    } finally {
      stopFinishingMatch();
    }
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="solid"
          colorScheme="red"
          leftIcon={<Icon as={FaTimes} />}
          isLoading={finishingMatch}
          {...props}
        >
          Finalizar partida
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Finalizar partida?</PopoverHeader>
        <PopoverBody>
          <Button
            w="full"
            variant="solid"
            colorScheme="red"
            onClick={handleFinishMatch}
            isLoading={finishingMatch}
          >
            Sim, tenho certeza.
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
