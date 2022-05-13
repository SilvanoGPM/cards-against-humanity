import { Tag } from '@blueprintjs/core';

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

        <Tag intent="primary" className={styles.version}>
          0.1.0 beta
        </Tag>
      </main>
    </div>
  );
}
