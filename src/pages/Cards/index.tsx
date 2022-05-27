import { H3 } from '@blueprintjs/core';

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
          <H3 className={`${styles.totalOfCards} ${styles.whites}`}>
            Total de respostas: {whites.length}
          </H3>
          {whites.map(({ id, message, type }, index) => (
            <Card
              key={id}
              message={message}
              type={type}
              animationType="auto"
              animationDelay={`${index >= 20 ? 0 : index * 500}ms`}
            />
          ))}
        </div>

        <div className={`${styles.cards} ${styles.blacks}`}>
          <H3 className={`${styles.totalOfCards} ${styles.blacks}`}>
            Total de perguntas: {blacks.length}
          </H3>
          {blacks.map(({ id, message, type }) => (
            <Card key={id} message={message} type={type} />
          ))}
        </div>
      </div>
    </section>
  );
}
