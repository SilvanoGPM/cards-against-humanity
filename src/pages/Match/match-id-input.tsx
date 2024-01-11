import { Button, Flex, Icon, Input, useToast } from '@chakra-ui/react';

import { FaCopy } from 'react-icons/fa';

interface MatchIdInputProps {
  id?: string | null;
}

export function MatchIdInput({ id }: MatchIdInputProps) {
  const toast = useToast();

  function handleCopyMatchId(): void {
    navigator.clipboard.writeText(id || '');

    toast({
      title: 'Código copiado',
      description: 'O código da partida foi copiado com sucesso.',
      status: 'info',
    });
  }

  return (
    <Flex>
      <Input readOnly value={id || ''} borderColor="black" roundedRight="0" />

      <Button
        px="8"
        roundedLeft="0"
        rightIcon={<Icon as={FaCopy} />}
        onClick={handleCopyMatchId}
      >
        Copiar
      </Button>
    </Flex>
  );
}
