import {
  Link,
  Modal,
  ModalContent,
  ModalOverlay,
  keyframes,
} from '@chakra-ui/react';

import { checkMorningTime } from '@/utils/check-morning-time';
import { useState } from 'react';
import { Card } from '../Card';

export function AddCardLinkModal() {
  const [isOpen, setIsOpen] = useState(checkMorningTime());

  const upAnimation = keyframes`
    0% {
        transform: translate(-50%, 300%);
      }
      50% {
        transform: translate(-50%, 100%); /* Ajuste a altura conforme necessário */
      }
      80% {
        transform: translate(-50%, -60%); /* Ajuste a altura conforme necessário */
      }
      100% {
        transform: translate(-50%, -50%); /* Ajuste a altura conforme necessário */
      }
  `;

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} motionPreset="none">
      <ModalOverlay />
      <ModalContent mx="4" bg="transparent" overflow="hidden">
        <Link
          href="/cards?add"
          pos="fixed"
          top="50%"
          left="50%"
          transform="auto"
          translateX="-50%"
          translateY="-50%"
          zIndex="20"
          animation={`${upAnimation} 2s ease-in-out`}
          outline="none"
          boxShadow="none"
          _focus={{
            boxShadow: 'none',
            outline: 'none',
          }}
        >
          <Card
            message="Deseja adicionar uma nova carta? clique aqui."
            type="BLACK"
            animationType="auto"
            animationDelay="2s"
          />
        </Link>
      </ModalContent>
    </Modal>
  );
}
