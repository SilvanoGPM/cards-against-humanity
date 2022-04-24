import { useState } from 'react';
import { Spinner } from '@blueprintjs/core';

import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { setAnswerToLastRound } from '@/services/matches';

import { useRandomDeck } from './useRandomDeck';
import styles from './styles.module.scss';

interface CardsToPlayProps {
  match: MatchConvertedType;
}

export function CardsToPlay({ match }: CardsToPlayProps): JSX.Element {
  const { user } = useAuth();

  const { deck, isLoading } = useRandomDeck();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  function selectCard(cardId: string): () => void {
    return async () => {
      if (cardId === selectedCardId) {
        const data = {
          cards: deck.map(({ id }) => id),
          user: user.uid,
          awnser: selectedCardId || '',
        };

        await setAnswerToLastRound(match.id, data);

        setSelectedCardId(null);
        return;
      }
      setSelectedCardId(cardId);
    };
  }

  function renderCard(card: CardType): JSX.Element {
    const isSelected = card.id === selectedCardId;

    return (
      <button key={card.id} onClick={selectCard(card.id)}>
        <Card
          {...card}
          className={`${styles.cardToPlay} ${
            isSelected ? styles.isSelected : ''
          }`}
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
