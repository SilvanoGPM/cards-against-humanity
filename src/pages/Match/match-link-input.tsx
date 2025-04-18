import { Button, Flex, Icon, Input, useToast } from '@chakra-ui/react';

import { FaCopy } from 'react-icons/fa';

export function MatchLinkInput() {
  const toast = useToast();

  function handleCopyMatchId(): void {
    navigator.clipboard.writeText(window.location.href);

    toast({
      title: 'Link copiado',
      description: 'O link da partida foi copiado com sucesso.',
      status: 'info',
    });
  }

  return (
    <Flex>
      <Input
        readOnly
        value={window.location.href}
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
  );
}
