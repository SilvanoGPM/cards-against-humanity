import { AiOutlineLoading } from 'react-icons/ai';

import { Center, Heading } from '@chakra-ui/react';

import styles from './styles.module.scss';

interface SomeLoadingProps {
  loading: boolean;
  message?: string;
}

export function SomeLoading({
  loading,
  message = 'Loading...',
}: SomeLoadingProps): JSX.Element {
  return (
    <Center
      flexDir="column"
      pos="fixed"
      inset="0"
      bg="white"
      h="100vh"
      overflow="hidden"
      zIndex="100000"
      transition="0.2s ease-in-out"
      transform="auto"
      translateY={loading ? '0%' : '-100%'}
    >
      <AiOutlineLoading className={styles.loading} size={50} />

      <Heading as="h2" fontSize={{ base: 'xl', md: '2xl' }} textAlign="center">
        {message}
      </Heading>
    </Center>
  );
}
