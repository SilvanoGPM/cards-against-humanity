import { useEffect } from 'react';
import { Alert } from '@blueprintjs/core';
import { useStorage } from '@/hooks/useStorage';
import { useBoolean } from '@/hooks/useBoolean';

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
        Atualmente utilizamos o firebase gratuito como servidor, porém estamos
        recebendo muitos acessos o que pode dificultar a jogabilidade ou até
        mesmo exceder o limite do servidor, logo naquele dia não será possível
        mais jogar.
      </p>

      <p>
        Caso você possa contribuir de alguma forma(ideias de servidores gratuito
        melhores, doações para pagar o premium do firebase, etc), por favor
        envie um e-mail para silvanosilvino@hotmail.com.
      </p>
    </Alert>
  );
}
