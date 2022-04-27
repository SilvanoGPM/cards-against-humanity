import { useState } from 'react';
import { Button, H3 } from '@blueprintjs/core';

import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { setAnswerToLastRound } from '@/services/matches';
import { AppToaster, BottomToaster } from '@/components/Toast';
import { CARD_TOKEN } from '@/constants/globals';
import { countString } from '@/utils/countString';
import { useBoolean } from '@/hooks/useBoolean';

import { useFetchDeck } from './useFetchDeck';
import styles from './styles.module.scss';

interface CardsToPlayProps {
  match: MatchConvertedType;
  isFirstTime: boolean;
}

export function CardsToPlay({
  match,
  isFirstTime,
}: CardsToPlayProps): JSX.Element {
  const { user } = useAuth();

  const { deck } = useFetchDeck(match, isFirstTime);

  const [selectedCardsId, setSelectedCardsId] = useState<string[]>([]);
  const [sending, setTrueSending, setFalseSending] = useBoolean(false);

  const { question } = match.rounds[0];

  const totalOfPlays = countString(question.message, CARD_TOKEN) || 1;

  function selectCard(cardId: string): () => void {
    return () => {
      if (selectedCardsId.includes(cardId)) {
        const newSelectedCardsId = selectedCardsId.filter(
          (id) => cardId !== id
        );

        setSelectedCardsId(newSelectedCardsId);
        return;
      }

      if (selectedCardsId.length === totalOfPlays) {
        const [, ...otherCardsId] = selectedCardsId;

        setSelectedCardsId([...otherCardsId, cardId]);

        return;
      }

      setSelectedCardsId([...selectedCardsId, cardId]);
    };
  }

  async function confirmPlay(): Promise<void> {
    try {
      if (selectedCardsId.length !== totalOfPlays) {
        BottomToaster.show({
          intent: 'primary',
          message: `Selecione ${totalOfPlays} cartas para jogar!`,
        });

        return;
      }

      setTrueSending();

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
        user: user.uid,
        awnsers: selectedCardsId,
      };

      await setAnswerToLastRound(match.id, data);

      setSelectedCardsId([]);
    } catch {
      AppToaster.show({
        intent: 'danger',
        icon: 'error',
        message: 'Erro ao tentar enviar resposta!',
      });
    } finally {
      setFalseSending();
    }
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

  if (match.rounds.length === 0) {
    return <div />;
  }

  return (
    <div className={styles.cardsToPlayWrapper}>
      <ul className={styles.cardsToPlay}>{deck.map(renderCard)}</ul>
      {isFirstTime && (
        <H3 className={styles.nextRoundText}>Você joga na próxima rodada...</H3>
      )}
      <div className={styles.confirmButtonWrapper}>
        <Button
          text="Confirmar"
          loading={sending}
          icon="confirm"
          intent="success"
          onClick={confirmPlay}
          className={`${styles.confirmButton} ${
            selectedCardsId.length === totalOfPlays ? styles.show : ''
          }`}
        />
      </div>
    </div>
  );
}
