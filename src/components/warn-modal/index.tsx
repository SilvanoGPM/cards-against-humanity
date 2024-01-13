import { useAuth } from '@/contexts/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import {
  Button,
  Flex,
  Heading,
  Icon,
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

import { CiWarning } from 'react-icons/ci';

export function WarnModal() {
  const { authenticated } = useAuth();

  const [isOpen, setIsOpen, isLoading] = useStorage(
    '@CARDS_AGAINST_HUMANITY/WARN_MODAL',
    true
  );

  function handleCloseModal() {
    setIsOpen(false);
  }

  if (!authenticated) {
    return null;
  }

  return (
    <Modal isOpen={isOpen && !isLoading} onClose={handleCloseModal}>
      <ModalOverlay />
      <ModalContent mx="4">
        <ModalHeader>
          <Flex align="center" gap="1">
            <Icon as={CiWarning} />

            <Heading as="h2" fontSize="xl">
              Atenção
            </Heading>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody color="gray.800">
          <VStack w="full">
            <Text>
              Originalmente, tratava-se de um jogo pessoal, o que significa que
              ele pode incluir cartas EXTREMAMENTE específicas.
            </Text>

            <Text>
              Atualmente, fazemos uso do serviço gratuito do Firebase como
              servidor. No entanto, devido ao aumento significativo no número de
              acessos, estamos enfrentando desafios que podem impactar a
              experiência de jogo ou, em último caso, resultar na ultrapassagem
              do limite do servidor. Nesse cenário, haverá a impossibilidade de
              continuar jogando a partir daquele dia.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter flexDir="column" gap="2">
          <Button w="full" onClick={handleCloseModal}>
            Entendido
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
