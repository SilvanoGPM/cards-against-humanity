import { AdBanner } from '@/components/AdBanner';
import { GoBack } from '@/components/GoBack';
import { SomeLoading } from '@/components/SomeLoading';

import { Box, Container } from '@chakra-ui/react';
import { LastMatches } from './LastMatches';
import { useLastMatches } from './useLastMatches';

export function Matches(): JSX.Element {
  const { loading: loadingLastMatches, matches, setMatches } = useLastMatches();

  return (
    <>
      <SomeLoading
        loading={loadingLastMatches}
        message="Carregando as últimas partidas..."
      />

      <Box pos="absolute" top="-12" left="4">
        <GoBack />
      </Box>

      <Container as="main" maxW="1100px" mt="16" flexDir="column">
        <LastMatches matches={matches} onMatchesChange={setMatches} />
        <AdBanner zoneId="ZONE_ID" />
      </Container>
    </>
  );
}
