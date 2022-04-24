import { useNavigate } from 'react-router-dom';
import { Icon } from '@blueprintjs/core';

import styles from './styles.module.scss';

export function GoBack(): JSX.Element {
  const navigate = useNavigate();

  function hanldeGoBack(): void {
    navigate('/');
  }

  return (
    <Icon
      className={styles.goBack}
      icon="arrow-left"
      size={20}
      onClick={hanldeGoBack}
    />
  );
}
