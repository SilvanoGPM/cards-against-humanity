import { useNavigate } from 'react-router-dom';

import { useBoolean } from '@/hooks/useBoolean';
import { newMatch } from '@/services/matches';

export function Home(): JSX.Element {
  const navigate = useNavigate();

  const [creating, startCreate, stopCreate] = useBoolean(false);

  async function handleNewMatch(): Promise<void> {
    try {
      startCreate();

      const id = await newMatch('SkyG0D');

      navigate(`/match/${id}`);
    } catch (error) {
      console.error('error', error);
    } finally {
      stopCreate();
    }
  }

  return (
    <div>
      <button disabled={creating} type="button" onClick={handleNewMatch}>
        Criar partida
      </button>

      {creating && <p>Criando...</p>}
    </div>
  );
}
