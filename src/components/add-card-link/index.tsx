import {
  Link,
  Modal,
  ModalContent,
  ModalOverlay,
  keyframes,
} from '@chakra-ui/react';

import { checkMorningTime } from '@/utils/check-morning-time';
import { useEffect, useState } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { Card } from '../Card';

export function AddCardLinkModal() {
  const [isOpen, setIsOpen] = useState(false);

  const [closedAt, setClosedAt, loading] = useStorage<string | null>(
    'add-card-link-modal-closed-at',
    null
  );

  useEffect(() => {
    const now = new Date();
    const closedAtDate = closedAt ? new Date(closedAt) : null;

    if (
      closedAtDate &&
      now.getTime() - closedAtDate.getTime() < 7 * 24 * 60 * 30 * 1000 // 7 dias
    ) {
      setIsOpen(false);
    } else if (!loading) {
      setIsOpen(checkMorningTime());
    }
  }, [closedAt, setIsOpen, loading]);

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
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        setClosedAt(new Date().toISOString());
      }}
      motionPreset="none"
    >
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
