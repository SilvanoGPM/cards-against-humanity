import { useState } from 'react';
import { Button, Spinner } from '@blueprintjs/core';

import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { setAnswerToLastRound } from '@/services/matches';
import { AppToaster } from '@/components/Toast';
import { CARD_TOKEN } from '@/constants/globals';
import { countString } from '@/utils/countString';

import { useRandomDeck } from './useRandomDeck';
import styles from './styles.module.scss';

interface CardsToPlayProps {
  match: MatchConvertedType;
}

export function CardsToPlay({ match }: CardsToPlayProps): JSX.Element {
  const { user } = useAuth();

  const { deck, isLoading } = useRandomDeck();

  const [selectedCardsId, setSelectedCardsId] = useState<string[]>([]);

  function selectCard(cardId: string): () => void {
    return () => {
      const { question } = match.rounds[0];

      const totalOfPlays = countString(question.message, CARD_TOKEN) || 1;

      if (selectedCardsId.includes(cardId)) {
        const newSelectedCardsId = selectedCardsId.filter(
          (id) => cardId !== id
        );

        setSelectedCardsId(newSelectedCardsId);
        return;
      }

      if (selectedCardsId.length === totalOfPlays) {
        return;
      }

      setSelectedCardsId([...selectedCardsId, cardId]);
    };
  }

  function renderCard(card: CardType): JSX.Element {
    const isSelected = selectedCardsId.includes(card.id);

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

  async function confirmPlay(): Promise<void> {
    const containsSomeCard = match.rounds[0].answers.find(
      (lastAwnser) =>
        selectedCardsId.some((awnser) => awnser === lastAwnser.card.id) &&
        user.uid === lastAwnser.user.uid
    );

    if (containsSomeCard) {
      AppToaster.show({
        intent: 'primary',
        message: 'Você já adicionou essa carta!',
      });

      return;
    }

    const data = {
      cards: deck.map(({ id }) => id),
      user: user.uid,
      awnsers: selectedCardsId,
    };

    await setAnswerToLastRound(match.id, data);

    setSelectedCardsId([]);
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
      <div className={styles.confirmButtonWrapper}>
        <Button
          text="Confirmar"
          icon="confirm"
          intent="success"
          onClick={confirmPlay}
          className={`${styles.confirmButton} ${
            selectedCardsId.length > 0 ? styles.show : ''
          }`}
        />
      </div>
    </div>
  );
}
