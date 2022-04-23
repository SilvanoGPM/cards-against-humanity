import { useParams } from 'react-router-dom';

import { useUser } from '@/contexts/UserContext';

import { useSetupMatch } from './useSetupMatch';

export function Match(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { name } = useUser();

  const { isLoading, match, nextRound } = useSetupMatch(id || '');

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  const round = match.rounds.length;

  return (
    <div>
      <h2>Match owner: {match.owner}</h2>
      <p>Users: {match.users.join(' | ')}</p>

      {round > 0 && <p>{round}° Round</p>}

      {match.owner === name && (
        <button type="button" onClick={nextRound}>
          {round === 0 ? 'Iniciar partida' : 'Próximo round'}
        </button>
      )}
    </div>
  );
}
