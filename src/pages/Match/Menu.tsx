import { Button, Colors, Drawer } from '@blueprintjs/core';
import { forwardRef, useImperativeHandle } from 'react';
import { AiFillCopy } from 'react-icons/ai';

import { AppToaster } from '@/components/Toast';
import { useBoolean } from '@/hooks/useBoolean';

import { UsersList } from './UsersList';

import qrCode from '../../assets/qrcode.png';

import styles from './styles.module.scss';

interface MenuProps {
  match: MatchConvertedType;
}

export interface MenuHandles {
  openDrawer: () => void;
}

function MenuComponent(
  { match }: MenuProps,
  ref: React.ForwardedRef<MenuHandles>
): JSX.Element {
  const [isOpen, openDrawer, closeDrawer] = useBoolean(false);

  useImperativeHandle(ref, () => ({
    openDrawer,
  }));

  function handleCopyMatchId(): void {
    navigator.clipboard.writeText(match.id);
    AppToaster.show({
      intent: 'success',
      message: 'Código copiado com sucesso',
    });
  }

  return (
    <Drawer isOpen={isOpen} onClose={closeDrawer} title="Menu">
      <div className={styles.copyMatchIdWrapper}>
        <p style={{ color: Colors.GRAY1 }}>Envie o código para seus amigos:</p>

        <div className={styles.copyMatchId}>
          <input defaultValue={match.id} />
          <Button
            onClick={handleCopyMatchId}
            intent="primary"
            icon={<AiFillCopy />}
          />
        </div>
      </div>

      <UsersList match={match} />

      <div className={styles.aux}>
        <p style={{ color: Colors.GRAY1 }}>
          Deseja auxiliar no projeto? Considere me pagar um café 😊
        </p>

        <img alt="QRCode do Pix" src={qrCode} />
      </div>
    </Drawer>
  );
}

export const Menu = forwardRef<MenuHandles, MenuProps>(MenuComponent);
