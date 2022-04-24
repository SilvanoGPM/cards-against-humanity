import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@blueprintjs/core';

import { useBoolean } from '@/hooks/useBoolean';
import { newMatch } from '@/services/matches';
import { useAuth } from '@/contexts/AuthContext';

import styles from './styles.module.scss';

export function ButtonsMenu(): JSX.Element {
  const navigate = useNavigate();

  const { user, handleLogout } = useAuth();

  const [creating, startCreate, stopCreate] = useBoolean(false);

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

  return (
    <section className={styles.buttonsMenu}>
      <Button
        loading={creating}
        large
        intent="success"
        onClick={handleNewMatch}
      >
        Criar partida
      </Button>
      <Link to="/cards">
        <Button disabled={creating} large intent="primary">
          Ver cartas
        </Button>
      </Link>

      <Link to="/new-card">
        <Button disabled={creating} large intent="primary">
          Criar carta
        </Button>
      </Link>

      <Button disabled={creating} large intent="danger" onClick={handleLogout}>
        Sair
      </Button>
    </section>
  );
}
