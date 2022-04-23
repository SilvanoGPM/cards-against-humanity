import { useNavigate } from 'react-router-dom';

import { useBoolean } from '@/hooks/useBoolean';
import { newMatch } from '@/services/matches';
import { useAuth } from '@/contexts/AuthContext';
import { EnterInMatch } from './EnternMatch';

export function Home(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();

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

      <button disabled={creating} type="button" onClick={handleNewMatch}>
        Criar partida
      </button>

      <EnterInMatch />

      {creating && <p>Criando...</p>}
    </div>
  );
}
