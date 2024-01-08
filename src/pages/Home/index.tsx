import { Tag } from '@blueprintjs/core';
import { Container, Flex } from '@chakra-ui/react';

import { version } from '../../../package.json';
import { ButtonsMenu } from './ButtonsMenu';
import { EnterInMatch } from './EnternMatch';
import { WarnAlert } from './WarnAlert';
import { Header } from './header';

import styles from './styles.module.scss';
import { Tags } from './tags';

import { Contribution } from './contribution';
import { JoinMatch } from './join-match';
import { Actions } from './actions';

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

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <ButtonsMenu />
        <EnterInMatch />

        <Tag intent="primary" className={styles.version}>
          {version}.beta
        </Tag>

        <div className={styles.github}>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=SilvanoGPM&repo=cards-against-humanity&type=star&count=true&size=large"
            style={{ textAlign: 'center' }}
            frameBorder="0"
            scrolling="0"
            width="170"
            height="30"
            title="GitHub"
          />
        </div>

        <WarnAlert />
      </main>
    </div>
  );
}
