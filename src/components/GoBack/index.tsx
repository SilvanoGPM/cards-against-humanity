import { useNavigate } from 'react-router-dom';
import { Colors, Icon } from '@blueprintjs/core';

import styles from './styles.module.scss';

export function GoBack(): JSX.Element {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{ color: Colors.BLACK }}
      className={styles.goBackButton}
    >
      <Icon className={styles.goBack} icon="arrow-left" size={20} />
    </button>
  );
}
