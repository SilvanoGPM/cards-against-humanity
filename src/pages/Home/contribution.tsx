import { Box, Flex, Heading, Link, Text } from '@chakra-ui/react';

import { PixQRCode } from '@/components/pix-qrcode';

export function Contribution() {
  return (
    <Flex
      align="center"
      ml="-1"
      mb={{ base: '24', lg: '0' }}
      mt={{ base: '8', lg: '0' }}
      flexDir={{ base: 'column-reverse', lg: 'row' }}
    >
      <PixQRCode w="95px" h="95px" />

      <Box textAlign={{ base: 'center', lg: 'start' }}>
        <Heading as="h2" fontSize="xl">
          Contribuições ❤️
        </Heading>

        <Text color="gray.600" fontSize="small">
          Considere realizar uma doação para auxiliar na manutenção do projeto.{' '}
          <br /> Melhorias? Envie um e-mail para{' '}
          <Link
            href="mailto:silvanosilvino@hotmail.com"
            fontWeight="bold"
            textDecor="underline"
          >
            silvanosilvino@hotmail.com
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}
