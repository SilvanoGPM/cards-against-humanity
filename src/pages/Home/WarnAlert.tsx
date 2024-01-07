import { useBoolean } from '@/hooks/useBoolean';
import { useStorage } from '@/hooks/useStorage';
import { Alert } from '@blueprintjs/core';
import { useEffect } from 'react';

export function WarnAlert(): JSX.Element {
  const [isOpen, setIsOpen] = useStorage(
    '@CARDS_AGAINST_HUMANITY/ALERT_PEN',
    true
  );

  const [isOpenState, , close] = useBoolean(isOpen);

  useEffect(() => {
    if (!isOpen) {
      close();
    }
  }, [isOpen, close]);

  function handleCancel(): void {
    close();
    setIsOpen(false);
  }

  return (
    <Alert
      confirmButtonText="Entendi"
      icon="warning-sign"
      onConfirm={close}
      onCancel={handleCancel}
      cancelButtonText="Não mostrar mais"
      isOpen={isOpenState}
    >
      <p>
        Originalmente, tratava-se de um jogo pessoal, o que significa que ele
        pode incluir cartas EXTREMAMENTE específicas.
      </p>

      <p>
        Atualmente, fazemos uso do serviço gratuito do Firebase como servidor.
        No entanto, devido ao aumento significativo no número de acessos,
        estamos enfrentando desafios que podem impactar a experiência de jogo
        ou, em último caso, resultar na ultrapassagem do limite do servidor.
        Nesse cenário, haverá a impossibilidade de continuar jogando a partir
        daquele dia.
      </p>

      <p>
        Caso você possa contribuir de alguma forma(ideias de servidores gratuito
        melhores, doações para pagar o premium do firebase, etc), por favor
        envie um e-mail para silvanosilvino@hotmail.com.
      </p>
    </Alert>
  );
}
