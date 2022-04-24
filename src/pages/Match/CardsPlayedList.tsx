import { H2 } from '@blueprintjs/core';

import { Card } from '@/components/Card';

import styles from './styles.module.scss';
import avatar from '../../assets/avatar.png';

interface CardsPlayedListProps {
  match: MatchConvertedType;
}

export function CardsPlayedList({ match }: CardsPlayedListProps): JSX.Element {
  function renderAnswers(answer: AnswersConvertedType): JSX.Element {
    return (
      <div className={styles.cardPlayedWrapper} key={answer.user.uid}>
        <Card {...answer.card} />
        <figure>
          <img
            title={answer.user.displayName || ''}
            alt={answer.user.displayName || ''}
            src={answer.user.photoURL || avatar}
          />
        </figure>
      </div>
    );
  }

  if (match.rounds.length === 0) {
    return <div />;
  }

  const hasCardsPlayed = match?.rounds?.[0].answers.length > 0;

  return (
    <div className={styles.cardsPlayedWrapper}>
      {hasCardsPlayed && <H2>Cartas já jogadas:</H2>}
      <ul className={styles.cardsPlayed}>
        {match.rounds[0].answers.map(renderAnswers)}
      </ul>
    </div>
  );
}
