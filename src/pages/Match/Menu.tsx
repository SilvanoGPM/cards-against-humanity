import { forwardRef, useImperativeHandle } from 'react';
import { AiFillCopy } from 'react-icons/ai';
import { Button, Drawer } from '@blueprintjs/core';

import { AppToaster } from '@/components/Toast';
import { useBoolean } from '@/hooks/useBoolean';

import { UsersList } from './UsersList';

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
      <UsersList match={match} />
      <div className={styles.copyMatchId}>
        <input defaultValue={match.id} />
        <Button
          onClick={handleCopyMatchId}
          intent="primary"
          icon={<AiFillCopy />}
        />
      </div>
    </Drawer>
  );
}

export const Menu = forwardRef<MenuHandles, MenuProps>(MenuComponent);
