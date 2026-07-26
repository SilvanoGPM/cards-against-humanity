import { Container, Flex } from '@chakra-ui/react';
import { useState } from 'react';

import { CookiesModal } from '@/components/cookies-modal';
import { Actions } from './actions';
import { Contribution } from './contribution';
import { Header } from './header';
import { JoinMatch } from './join-match';
import { QuotaBanner } from './quota-banner';
import { Tags } from './tags';

export function Home(): JSX.Element {
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  return (
    <>
      <CookiesModal />

      <Container
        as={Flex}
        maxW="1100px"
        minH="100vh"
        direction="column"
        pos="relative"
      >
        <Header />

        {quotaExceeded && (
          <QuotaBanner onClose={() => setQuotaExceeded(false)} />
        )}

        <Flex
          as="main"
          gap={{ base: '16', lg: '8' }}
          mt={{ base: '8', lg: '16' }}
          flexDir={{ base: 'column', lg: 'row' }}
        >
          <Actions onQuotaExceeded={() => setQuotaExceeded(true)} />

          <Flex flexDir="column" gap="2" mt="-2" flex="1">
            <JoinMatch />
            <Contribution />
          </Flex>
        </Flex>

        <Tags />
      </Container>
    </>
  );
}
