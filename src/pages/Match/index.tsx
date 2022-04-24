import { useParams } from 'react-router-dom';
import { Button, Tag } from '@blueprintjs/core';

import { useAuth } from '@/contexts/AuthContext';
import { SomeLoading } from '@/components/SomeLoading';
import { Card } from '@/components/Card';

import { useSetupMatch } from './useSetupMatch';
import { CardsPlayedList } from './CardsPlayedList';
import { UsersList } from './UsersList';
import styles from './styles.module.scss';

export function Match(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { isLoading, match, nextRound } = useSetupMatch(id || '');

  const round = match?.rounds?.length;

  return (
    <div className={styles.container}>
      <SomeLoading loading={isLoading} message="Carregando partida..." />

      {!isLoading && (
        <>
          <Card {...match.rounds[0].question} />

          <CardsPlayedList match={match} />
          <UsersList match={match} />

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
            <Button intent="primary" onClick={nextRound}>
              {round === 0 ? 'Iniciar partida' : 'Próximo round'}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
