import { Fragment } from 'react';
import { Divider, H2, H3 } from '@blueprintjs/core';

import { Card } from '@/components/Card';
import { getFirstString } from '@/utils/getFirstString';

import styles from './styles.module.scss';
import avatar from '../../assets/avatar.png';

interface CardsPlayedListProps {
  match: MatchConvertedType;
}

interface GroupedAnswersType {
  user: UserType;
  cards: CardType[];
}

export function CardsPlayedList({ match }: CardsPlayedListProps): JSX.Element {
  const groupedAnswers = match.rounds[0].answers.reduce<GroupedAnswersType[]>(
    (grouped, { card, user }) => {
      const groupFound = grouped.find((group) => group.user.uid === user.uid);

      if (groupFound) {
        groupFound.cards.push(card);
        return grouped;
      }

      return [...grouped, { user, cards: [card] }];
    },
    []
  );

  function renderCard(card: CardType): JSX.Element {
    return <Card key={card.id} {...card} />;
  }

  function renderAnswers(
    group: GroupedAnswersType,
    index: number
  ): JSX.Element {
    const name = group.user.displayName || '';

    return (
      <Fragment key={group.user.uid}>
        <div className={styles.cardPlayedWrapper}>
          <div className={styles.cardsGroup}>{group.cards.map(renderCard)}</div>
          <div className={styles.user}>
            <figure>
              <img
                title={name}
                alt={name}
                src={group.user.photoURL || avatar}
                onError={(event) => {
                  // eslint-disable-next-line
                  event.currentTarget.src = avatar;
                }}
              />
            </figure>
            <H3 style={{ margin: 0 }}>{getFirstString(name)}</H3>
          </div>
        </div>
        {index !== groupedAnswers.length - 1 && <Divider />}
      </Fragment>
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
        {groupedAnswers.map(renderAnswers)}
      </ul>
    </div>
  );
}
