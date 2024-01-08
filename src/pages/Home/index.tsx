import { Container, Flex } from '@chakra-ui/react';

import { Header } from './header';
import { Contribution } from './contribution';
import { JoinMatch } from './join-match';
import { Actions } from './actions';
import { Tags } from './tags';

export function Home(): JSX.Element {
  return (
    <Container
      as={Flex}
      maxW="1100px"
      minH="100vh"
      direction="column"
      pos="relative"
    >
      <Header />

      <Flex
        as="main"
        gap={{ base: '16', lg: '8' }}
        mt={{ base: '8', lg: '16' }}
        flexDir={{ base: 'column', lg: 'row' }}
      >
        <Actions />

        <Flex flexDir="column" gap="2" mt="-2" flex="1">
          <JoinMatch />
          <Contribution />
        </Flex>
      </Flex>

      <Tags />
    </Container>
  );
}
