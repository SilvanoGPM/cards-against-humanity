import { H2 } from '@blueprintjs/core';
import { AiOutlineLoading } from 'react-icons/ai';

import styles from './styles.module.scss';

interface SomeLoadingProps {
  loading: boolean;
  message?: string;
}

export function SomeLoading({
  loading,
  message = 'Loading...',
}: SomeLoadingProps): JSX.Element {
  return (
    <div className={`${styles.container} ${loading ? styles.show : ''}`}>
      <AiOutlineLoading className={styles.loading} size={50} />
      <H2>{message}</H2>
    </div>
  );
}
