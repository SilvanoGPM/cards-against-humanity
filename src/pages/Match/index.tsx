import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Tag } from '@blueprintjs/core';

import { useAuth } from '@/contexts/AuthContext';
import { SomeLoading } from '@/components/SomeLoading';
import { Card } from '@/components/Card';
import { GoBack } from '@/components/GoBack';

import { useSetupMatch } from './useSetupMatch';
import { CardsPlayedList } from './CardsPlayedList';
import { UsersListHandles } from './UsersList';
import { CardsToPlay } from './CardsToPlay';
import { Menu } from './Menu';

import styles from './styles.module.scss';

export function Match(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { isLoading, match, nextRound } = useSetupMatch(id || '');

  const menuRef = useRef<UsersListHandles>(null);

  const round = match?.rounds?.length;
  const userAlreadyPlayed = match?.rounds?.[0].answers.find(
    (answers) => answers.user.uid === user.uid
  );

  return (
    <div className={styles.container}>
      <SomeLoading loading={isLoading} message="Carregando partida..." />

      {!isLoading && (
        <>
          <div className={styles.question}>
            <Card {...match.rounds[0].question} />
          </div>

          <div className={styles.goBack}>
            <GoBack />
          </div>

          {!userAlreadyPlayed && <CardsToPlay match={match} />}

          <CardsPlayedList match={match} />

          <Menu ref={menuRef} match={match} />

          <Button
            intent="success"
            className={styles.menu}
            onClick={menuRef.current?.openDrawer}
            icon="user"
          />

          {round > 0 && (
            <Tag
              large
              intent="primary"
              round
              rightIcon="flag"
              className={styles.rounds}
            >
              {round}° Round
            </Tag>
          )}

          {match.owner.uid === user.uid && (
            <div className={styles.manageButton}>
              <Button
                intent="primary"
                onClick={nextRound}
                large
                rightIcon="direction-right"
              >
                {round === 0 ? 'Iniciar partida' : 'Próximo round'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
