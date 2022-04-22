import { useParams } from 'react-router-dom';

import { useSetupMatch } from './useSetupMatch';

export function Match(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  const { isLoading, match } = useSetupMatch(id || '');

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h2>Match owner: {match.owner}</h2>
      <p>Users: {match.users.join(' | ')}</p>
    </div>
  );
}
