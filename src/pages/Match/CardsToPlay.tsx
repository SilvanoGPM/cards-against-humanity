import { Spinner } from '@blueprintjs/core';

import { Card } from '@/components/Card';

import { useRandomDeck } from './useRandomDeck';
import styles from './styles.module.scss';

interface CardsToPlayProps {
  match: MatchConvertedType;
}

export function CardsToPlay({ match }: CardsToPlayProps): JSX.Element {
  const { deck, isLoading } = useRandomDeck();

  function renderCard(card: CardType): JSX.Element {
    return (
      <button key={card.id}>
        <Card
          {...card}
          className={styles.cardToPlay}
          messageClassName={styles.cardToPlayText}
        />
      </button>
    );
  }

  if (match.rounds.length === 0) {
    return <div />;
  }

  if (isLoading) {
    return <Spinner intent="primary" />;
  }

  return (
    <div className={styles.cardsToPlayWrapper}>
      <ul className={styles.cardsToPlay}>{deck.map(renderCard)}</ul>
    </div>
  );
}
