import { Colors, Icon } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';

import styles from './styles.module.scss';

export function GoBack({ toHome = true }: { toHome?: boolean }): JSX.Element {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (toHome ? navigate('/') : navigate(-1))}
      style={{ color: Colors.BLACK }}
      className={styles.goBackButton}
    >
      <Icon className={styles.goBack} icon="arrow-left" size={20} />
    </button>
  );
}
