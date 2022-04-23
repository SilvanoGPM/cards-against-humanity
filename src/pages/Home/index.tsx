import { useNavigate } from 'react-router-dom';

import { useBoolean } from '@/hooks/useBoolean';
import { newMatch } from '@/services/matches';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';

import { EnterInMatch } from './EnternMatch';

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
      <h2>Seja bem vindo! {user.displayName}</h2>

      <Button disabled={creating} type="button" onClick={handleNewMatch}>
        Criar partida
      </Button>

      <Button onClick={handleLogout} variant="outlined">
        Logout
      </Button>

      <EnterInMatch />

      {creating && <p>Criando...</p>}
    </div>
  );
}
