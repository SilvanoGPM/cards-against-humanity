import { EnterInMatch } from './EnternMatch';
import { UserInfo } from './UserInfo';
import { ButtonsMenu } from './ButtonsMenu';

import styles from './styles.module.scss';

export function Home(): JSX.Element {
  return (
    <div className={styles.container}>
      <UserInfo />

      <main className={styles.main}>
        <ButtonsMenu />
        <EnterInMatch />

        <p className={styles.version}>0.1.0 beta</p>
      </main>
    </div>
  );
}
