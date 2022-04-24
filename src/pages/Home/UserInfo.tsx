import { WhiteLogo } from '@/components/Card/Logos';
import { useAuth } from '@/contexts/AuthContext';
import { getFirstString } from '@/utils/getFirstString';

import avatar from '../../assets/avatar.png';

import styles from './styles.module.scss';

export function UserInfo(): JSX.Element {
  const { user } = useAuth();

  const userName =
    getFirstString(user.displayName) ||
    getFirstString(user.email, '@') ||
    'User';

  return (
    <div className={styles.userInfo}>
      <div className={styles.logo}>
        <WhiteLogo />
      </div>

      <p className={styles.logged}>
        Logado como: <span className={styles.userName}>{userName}</span>
      </p>

      <figure className={styles.avatar}>
        <img src={user.photoURL || avatar} alt={userName} />
      </figure>
    </div>
  );
}
