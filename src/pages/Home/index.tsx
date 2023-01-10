import { Tag } from '@blueprintjs/core';

import { ButtonsMenu } from './ButtonsMenu';
import { EnterInMatch } from './EnternMatch';
import { UserInfo } from './UserInfo';
import { WarnAlert } from './WarnAlert';
import { version } from '../../../package.json';

import styles from './styles.module.scss';

export function Home(): JSX.Element {
  return (
    <div className={styles.container}>
      <UserInfo />

      <main className={styles.main}>
        <ButtonsMenu />
        <EnterInMatch />

        <Tag intent="primary" className={styles.version}>
          {version}.beta
        </Tag>

        <div className={styles.github}>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=SilvanoGPM&repo=cards-against-humanity&type=star&count=true&size=large"
            style={{ textAlign: 'center' }}
            frameBorder="0"
            scrolling="0"
            width="170"
            height="30"
            title="GitHub"
          />
        </div>

        <WarnAlert />
      </main>
    </div>
  );
}
