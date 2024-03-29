import { getFirstString } from '@/utils/get-first-string';
import { Card, Colors, H3, Icon } from '@blueprintjs/core';

import { Avatar } from '@/components/Avatar';

import styles from './styles.module.scss';

interface UsersProps {
  match: MatchConvertedType;
}

export interface UsersListHandles {
  openDrawer: () => void;
}

export function UsersList({ match }: UsersProps): JSX.Element {
  function renderUser(user: UserType): JSX.Element {
    const isOwner = user.uid === match.owner.uid;
    const isStarted = match.rounds > 0;
    const userPlayed =
      isStarted &&
      match.actualRound?.usersWhoPlayed.find(
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
          <Avatar alt={user.displayName || ''} src={user.photoURL} />

          <H3 className={`${styles.userName} ${isOwner ? styles.isOwner : ''}`}>
            {getFirstString(user.displayName) ||
              getFirstString(user.email, '@') ||
              'Usuário'}
          </H3>
        </Card>
      </li>
    );
  }

  const otherUsers = match.users.filter(({ uid }) => uid !== match.owner.uid);

  return (
    <div className={styles.usersListWrapper}>
      <ul className={styles.usersList}>
        {renderUser(match.owner)}
        {otherUsers.map(renderUser)}
      </ul>
    </div>
  );
}
