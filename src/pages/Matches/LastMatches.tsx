import { Button, Card, H2, H5, NonIdealState, Text } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { Link, useNavigate } from 'react-router-dom';

import { Avatar } from '@/components/Avatar';
import { AppToaster } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { finishAllMatches, finishMatch, newMatch } from '@/services/matches';
import { getFirstString } from '@/utils/getFirstString';

import styles from './styles.module.scss';

interface LastMatchesProps {
  matches: MatchConvertedType[];
  onMatchesChange: (matches: MatchConvertedType[]) => void;
}

export function LastMatches({
  matches,
  onMatchesChange,
}: LastMatchesProps): JSX.Element {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [finishingMatch, startFinishingMatch, stopFinishingMatch] =
    useBoolean(false);

  const [creatingMatch, startCreate, stopCreate] = useBoolean(false);

  async function handleNewMatch(): Promise<void> {
    try {
      startCreate();

      const id = await newMatch(user.uid || '');

      navigate(`/match/${id}`);
    } catch (error) {
      console.error('error', error);
    } finally {
      stopCreate();
    }
  }

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

  async function handleFinishAllMatches(): Promise<void> {
    try {
      startFinishingMatch();

      await finishAllMatches(matches);

      onMatchesChange([]);

      AppToaster.show({
        intent: 'success',
        timeout: 1000,
        message: 'Todas as partidas foram finalizadas!',
      });
    } catch {
      AppToaster.show({
        intent: 'danger',
        message: 'Erro ao finalizar partidas',
      });
    } finally {
      stopFinishingMatch();
    }
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
    <section className={styles.lastMatches}>
      {matches.length === 0 ? (
        <div className={styles.emptyList}>
          <NonIdealState
            description="Que tal você iniciar uma?"
            icon="search"
            title="Nenhuma partida rolando 😢"
            action={
              <Button
                loading={creatingMatch}
                large
                intent="success"
                onClick={handleNewMatch}
              >
                Criar partida
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <H2>Últimas partidas</H2>

            {isAdmin && (
              <Popover2
                content={
                  <div className={styles.popoverContent}>
                    <H5>Finalizar todas as partidas?</H5>

                    <Button
                      large
                      intent="danger"
                      icon="cross"
                      onClick={handleFinishAllMatches}
                      loading={finishingMatch}
                    >
                      Sim, tenho certeza.
                    </Button>
                  </div>
                }
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
                  Encerrar todas as partidas
                </Button>
              </Popover2>
            )}
          </div>

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
                  <Text className={styles.text}>Rounds: {rounds}</Text>

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

                    {(isAdmin || owner.uid === user.uid) && (
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
        </>
      )}
    </section>
  );
}
