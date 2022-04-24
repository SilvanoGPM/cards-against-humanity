import { useNavigate } from 'react-router-dom';
import { Button } from '@blueprintjs/core';

import { useBoolean } from '@/hooks/useBoolean';
import { newMatch } from '@/services/matches';
import { useAuth } from '@/contexts/AuthContext';

import { EnterInMatch } from './EnternMatch';
import { UserInfo } from './UserInfo';

export function Home(): JSX.Element {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const [creating, startCreate, stopCreate] = useBoolean(false);

  async function handleNewMatch(): Promise<void> {
    try {
      startCreate();

      const id = await newMatch(user.email || '');

      navigate(`/match/${id}`);
    } catch (error) {
      console.error('error', error);
    } finally {
      stopCreate();
    }
  }

  return (
    <div>
      <UserInfo />

      <Button disabled={creating} type="button" onClick={handleNewMatch}>
        Criar partida
      </Button>

      <Button onClick={handleLogout}>Logout</Button>

      <EnterInMatch />

      {creating && <p>Criando...</p>}
    </div>
  );
}
