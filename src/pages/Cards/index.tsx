import { Card } from '@/components/Card';

import { GoBack } from '@/components/GoBack';
import { SomeLoading } from '@/components/SomeLoading';

import { useFetchCards } from './useFetchCards';
import styles from './styles.module.scss';

export function Cards(): JSX.Element {
  const { isLoading, cards } = useFetchCards();

  const whites = cards.filter(({ type }) => type === 'WHITE');
  const blacks = cards.filter(({ type }) => type === 'BLACK');

  return (
    <section className={styles.container}>
      <SomeLoading loading={isLoading} message="Carregando cartas..." />

      <div className={styles.goBack}>
        <GoBack />
      </div>

      <div className={styles.cardsContainer}>
        <div className={`${styles.cards} ${styles.whites}`}>
          {whites.map(({ id, message, type }) => (
            <Card key={id} message={message} type={type} />
          ))}
        </div>

        <div className={`${styles.cards} ${styles.blacks}`}>
          {blacks.map(({ id, message, type }) => (
            <Card key={id} message={message} type={type} />
          ))}
        </div>
      </div>
    </section>
  );
}
