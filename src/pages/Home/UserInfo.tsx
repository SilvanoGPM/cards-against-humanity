import { useAuth } from '@/contexts/AuthContext';
import { getFirstString } from '@/utils/getFirstString';

import avatar from './avatar.png';

import styles from './styles.module.scss';

export function UserInfo(): JSX.Element {
  const { user } = useAuth();

  const userName =
    getFirstString(user.displayName) ||
    getFirstString(user.email, '@') ||
    'User';

  return (
    <div className={styles.container}>
      <p className={styles.logged}>
        Logado como: <span className={styles.userName}>{userName}</span>
      </p>
      <figure className={styles.avatar}>
        <img src={user.photoURL || avatar} alt={userName} />
      </figure>
    </div>
  );
}
