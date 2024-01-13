import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';

import { RxCardStackPlus } from 'react-icons/rx';
import { PixQRCode } from '../pix-qrcode';

interface AddCardModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export function AddCardModal({ isOpen = false, onClose }: AddCardModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mx="4">
        <ModalHeader>
          <Flex align="center" gap="1">
            <Icon as={RxCardStackPlus} transform="auto" rotate="90" />

            <Heading as="h2" fontSize="xl">
              Adicionar carta
            </Heading>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody color="gray.800">
          <VStack w="full">
            <Text>
              Para incluir uma nova carta no jogo, solicitamos um suporte de um
              real por cada carta desejada. Basta enviar um Pix acompanhado de
              uma mensagem específica para cada carta desejada, como
              exemplificado abaixo:
            </Text>

            <Box fontStyle="italic" pl="1" color="gray.600">
              <Text>Pix de R$ 2.</Text>
              <Text>Carta preta: Por que a galinha atravessou a rua?</Text>
              <Text>Carta branca: Para chegar ao outro lado.</Text>
            </Box>

            <Text>
              Certamente, se a carta recebida for considerada HORRÍVEL,
              reembolsaremos o seu dinheiro. :)
            </Text>

            <Text>
              Para mais informações, entre em contato com o e-mail{' '}
              <Link
                href="mailto:silvanosilvino@hotmail.com"
                fontWeight="bold"
                textDecor="underline"
              >
                silvanosilvino@hotmail.com
              </Link>
              .
            </Text>

            <PixQRCode copyMessage="show" maxW="200px" />
          </VStack>
        </ModalBody>

        <ModalFooter flexDir="column" gap="2">
          <Button w="full" onClick={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
