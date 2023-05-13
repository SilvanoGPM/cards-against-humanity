import { SomeLoading } from '@/components/SomeLoading';
import { GoBack } from '@/components/GoBack';

import { useLastMatches } from './useLastMatches';
import { LastMatches } from './LastMatches';

import styles from './styles.module.scss';

export function Matches(): JSX.Element {
  const { loading: loadingLastMatches, matches, setMatches } = useLastMatches();

  return (
    <>
      <SomeLoading
        loading={loadingLastMatches}
        message="Carregando as últimas partidas..."
      />

      <div className={styles.goBack}>
        <GoBack />
      </div>

      <main className={styles.main}>
        <LastMatches matches={matches} onMatchesChange={setMatches} />
      </main>
    </>
  );
}
