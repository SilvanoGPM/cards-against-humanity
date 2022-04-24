import { forwardRef, useImperativeHandle } from 'react';

import { getFirstString } from '@/utils/getFirstString';
import { Card, Colors, Drawer, H3, Icon } from '@blueprintjs/core';
import { useBoolean } from '@/hooks/useBoolean';

import styles from './styles.module.scss';
import avatar from '../../assets/avatar.png';

interface UsersProps {
  match: MatchConvertedType;
}

export interface UsersListHandles {
  openDrawer: () => void;
}

export function UsersListComponent(
  { match }: UsersProps,
  ref: React.ForwardedRef<UsersListHandles>
): JSX.Element {
  const [isOpen, openDrawer, closeDrawer] = useBoolean(false);

  function renderUser(user: UserType): JSX.Element {
    const isOwner = user.uid === match.owner.uid;
    const isStarted = match.rounds.length > 0;
    const userPlayed =
      isStarted &&
      match.rounds[0].usersWhoPlayed.find(
        (played) => played.user.uid === user.uid
      );

    return (
      <li key={user.uid} className={styles.userCardWrapper}>
        {isOwner && (
          <Icon
            icon="crown"
            className={styles.crown}
            color={Colors.GOLD3}
            htmlTitle="Dono da sala"
          />
        )}
        <Card
          className={`${styles.userCard} ${userPlayed ? styles.isPlayed : ''}`}
        >
          <figure>
            <img alt={user.displayName || ''} src={avatar} />
          </figure>

          <H3 className={`${styles.userName} ${isOwner ? styles.isOwner : ''}`}>
            {getFirstString(user.displayName) ||
              getFirstString(user.email, '@') ||
              'Usuário'}
          </H3>
        </Card>
      </li>
    );
  }

  useImperativeHandle(ref, () => ({
    openDrawer,
  }));

  const otherUsers = match.users.filter(({ uid }) => uid !== match.owner.uid);

  return (
    <Drawer isOpen={isOpen} onClose={closeDrawer} title="Usuários">
      <div className={styles.usersListWrapper}>
        <ul className={styles.usersList}>
          {renderUser(match.owner)}
          {otherUsers.map(renderUser)}
        </ul>
      </div>
    </Drawer>
  );
}

export const UsersList = forwardRef<UsersListHandles, UsersProps>(
  UsersListComponent
);
