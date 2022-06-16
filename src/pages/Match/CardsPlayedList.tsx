import { Fragment } from 'react';
import { Divider, H2, H3 } from '@blueprintjs/core';

import { Card } from '@/components/Card';
import { getFirstString } from '@/utils/getFirstString';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/contexts/AuthContext';

import styles from './styles.module.scss';

interface CardsPlayedListProps {
  match: MatchConvertedType;
}

interface GroupedAnswersType {
  user: UserType;
  cards: CardType[];
}

export function CardsPlayedList({ match }: CardsPlayedListProps): JSX.Element {
  const { user } = useAuth();

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

  function renderCard(card: CardType, isActive: boolean): JSX.Element {
    return (
      <Card
        animationClickShowBack={isActive}
        key={card.id}
        {...card}
        animationType="click"
        className={styles.cardPlayedCursor}
      />
    );
  }

  function renderAnswers(
    group: GroupedAnswersType,
    index: number,
    skipOwnerOfCard = true
  ): JSX.Element | null {
    const name = group.user.displayName || '';

    if (skipOwnerOfCard && group.user.uid === user.uid) {
      return null;
    }

    return (
      <Fragment key={group.user.uid}>
        <div className={styles.cardPlayedWrapper}>
          <div className={styles.cardsGroup}>
            {group.cards.map((card) =>
              renderCard(card, group.user.uid === user.uid)
            )}
          </div>
          <div className={styles.user}>
            <Avatar alt={name} src={group.user.photoURL} />
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

  const userAnswers = groupedAnswers.find(
    (group) => group.user.uid === user.uid
  );

  return (
    <div className={styles.cardsPlayedWrapper}>
      {hasCardsPlayed && <H2>Cartas já jogadas:</H2>}
      <ul className={styles.cardsPlayed}>
        {userAnswers && renderAnswers(userAnswers, 0, false)}
        {groupedAnswers.map((group, index) => renderAnswers(group, index))}
      </ul>
    </div>
  );
}
