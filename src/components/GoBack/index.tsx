import { Link } from 'react-router-dom';
import { Colors, Icon } from '@blueprintjs/core';

import styles from './styles.module.scss';

export function GoBack(): JSX.Element {
  return (
    <Link to="/" style={{ color: Colors.BLACK }}>
      <Icon className={styles.goBack} icon="arrow-left" size={20} />
    </Link>
  );
}
