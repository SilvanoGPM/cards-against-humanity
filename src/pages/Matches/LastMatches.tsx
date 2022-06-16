import { Link } from 'react-router-dom';
import { Button, Card, H2, H5, Text } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

import { AppToaster } from '@/components/Toast';
import { getFirstString } from '@/utils/getFirstString';
import { Avatar } from '@/components/Avatar';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { finishMatch } from '@/services/matches';
import { useBoolean } from '@/hooks/useBoolean';

import styles from './styles.module.scss';

interface LastMatchesProps {
  matches: MatchConvertedType[];
  onMatchesChange: (matches: MatchConvertedType[]) => void;
}

export function LastMatches({
  matches,
  onMatchesChange,
}: LastMatchesProps): JSX.Element {
  const isAdmin = useIsAdmin();

  const [finishingMatch, startFinishingMatch, stopFinishingMatch] =
    useBoolean(false);

  function handleFinishMatch(id: string) {
    return async () => {
      try {
        startFinishingMatch();

        await finishMatch(id);

        const newMatches = matches.filter((match) => match.id !== id);

        onMatchesChange([...newMatches]);

        AppToaster.show({
          intent: 'success',
          timeout: 1000,
          message: 'Partida finalizada com sucesso!',
        });
      } catch {
        AppToaster.show({
          intent: 'danger',
          message: 'Erro ao finalizar partida',
        });
      } finally {
        stopFinishingMatch();
      }
    };
  }

  function renderPopoverContent(id: string): JSX.Element {
    return (
      <div className={styles.popoverContent}>
        <H5>Tem certeza que deseja finalizar esta partida?</H5>

        <Button
          large
          intent="danger"
          icon="cross"
          onClick={handleFinishMatch(id)}
          loading={finishingMatch}
        >
          Sim, tenho certeza.
        </Button>
      </div>
    );
  }

  return (
    <section>
      <H2>Últimas partidas</H2>

      <div className={styles.matchesList}>
        {matches.map(({ id, owner, rounds }) => (
          <Card key={id} className={styles.match}>
            <Avatar
              alt={getFirstString(owner.displayName)}
              src={owner.photoURL}
            />

            <div className={styles.matchInfo}>
              <Text className={styles.text}>
                Dono da sala: {getFirstString(owner.displayName)}
              </Text>
              <Text className={styles.text}>Rounds: {rounds.length}</Text>

              <div className={styles.buttons}>
                <Link to={`/match/${id}`}>
                  <Button
                    style={{ width: '100%' }}
                    large
                    intent="success"
                    icon="key-enter"
                  >
                    Entrar na partida
                  </Button>
                </Link>

                {isAdmin && (
                  <Popover2
                    content={renderPopoverContent(id)}
                    placement="bottom"
                    popoverClassName={styles.popover}
                  >
                    <Button
                      large
                      style={{ width: '100%' }}
                      intent="danger"
                      icon="cross"
                      loading={finishingMatch}
                    >
                      Encerrar partida
                    </Button>
                  </Popover2>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
