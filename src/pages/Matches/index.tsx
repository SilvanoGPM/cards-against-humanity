import { SomeLoading } from '@/components/SomeLoading';
import { useLastMatches } from './useLastMatches';

export function Matches(): JSX.Element {
  const { loading: loadingLastMatches, matches } = useLastMatches();

  return (
    <>
      <SomeLoading
        loading={loadingLastMatches}
        message="Carregando as últimas partidas..."
      />

      {matches.map(({ id }) => (
        <li>{id}</li>
      ))}
    </>
  );
}
