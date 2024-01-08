import { Center, Image, ImageProps, Text, useToast } from '@chakra-ui/react';

import qrCode from '../assets/qrcode.png';

interface PixQRCodeProps extends ImageProps {
  copyMessage?: 'show' | 'auto';
}

export function PixQRCode({ copyMessage = 'auto', ...props }: PixQRCodeProps) {
  const toast = useToast();

  function handleCopyPixKey() {
    navigator.clipboard.writeText('58fb39d7-aef5-4a02-b387-f746097ada43');

    toast({
      title: 'Chave copiada',
      status: 'success',
      description: 'A chave pix foi copiada com sucesso!',
    });
  }

  return (
    <Center
      flexDir="column"
      cursor="pointer"
      title="Clique para copiar a chave"
      onClick={handleCopyPixKey}
    >
      <Image src={qrCode} {...props} />

      <Text
        color="gray.600"
        fontSize="small"
        display={{
          base: 'block',
          lg: copyMessage === 'show' ? 'block' : 'none',
        }}
      >
        (Clique para copiar a chave)
      </Text>
    </Center>
  );
}
