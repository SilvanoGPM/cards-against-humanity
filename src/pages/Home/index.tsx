import { Tag } from '@blueprintjs/core';
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
  Input,
  Link,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';

import { FiSend } from 'react-icons/fi';
import { RiPhoneFindFill } from 'react-icons/ri';
import { RxCardStackPlus } from 'react-icons/rx';
import { TbCards } from 'react-icons/tb';

import { version } from '../../../package.json';
import { ButtonsMenu } from './ButtonsMenu';
import { EnterInMatch } from './EnternMatch';
import { WarnAlert } from './WarnAlert';
import { Header } from './header';

import styles from './styles.module.scss';
import { Tags } from './tags';

import qrCode from '../../assets/qrcode.png';

export function Home(): JSX.Element {
  const toast = useToast();

  function handleCopyPixKey() {
    navigator.clipboard.writeText('58fb39d7-aef5-4a02-b387-f746097ada43');

    toast({
      title: 'Chave copiada',
      status: 'success',
      description: 'A chave pix foi copiada com sucesso!',
    });
  }

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
        <VStack flex="1">
          <Button
            leftIcon={
              <Icon as={RxCardStackPlus} transform="auto" rotate="90" />
            }
            w="full"
          >
            Nova partida
          </Button>

          <Button
            leftIcon={
              <Icon as={RiPhoneFindFill} transform="auto" rotate="90" />
            }
            w="full"
            variant="defaultOutlined"
          >
            Encontrar partidas
          </Button>

          <Button
            leftIcon={<Icon as={TbCards} transform="auto" rotate="90" />}
            w="full"
            variant="defaultOutlined"
          >
            Ver cartas
          </Button>

          <Button
            leftIcon={
              <Icon as={RxCardStackPlus} transform="auto" rotate="90" />
            }
            w="full"
            variant="defaultOutlined"
          >
            Nova carta
          </Button>
        </VStack>

        <Flex flexDir="column" gap="2" mt="-2" flex="1">
          <Box>
            <Heading as="h1" fontSize="2xl">
              Entre em uma partida
            </Heading>

            <Text color="gray.600" fontSize="small">
              Peça para seu amigo enviar o código da partida para que você possa
              entrar na partida.
            </Text>
          </Box>

          <Flex>
            <Input
              placeholder="Código da partida"
              borderColor="black"
              roundedRight="0"
            />

            <Button
              px="8"
              roundedLeft="0"
              rightIcon={<Icon as={FiSend} transform="auto" rotate="45" />}
            >
              Entrar
            </Button>
          </Flex>

          <Flex
            align="center"
            ml="-1"
            mb={{ base: '24', lg: '0' }}
            mt={{ base: '8', lg: '0' }}
            flexDir={{ base: 'column-reverse', lg: 'row' }}
          >
            <Center
              flexDir="column"
              cursor="pointer"
              title="Clique para copiar a chave"
              onClick={handleCopyPixKey}
            >
              <Image src={qrCode} w="95px" h="95px" />

              <Text
                color="gray.600"
                fontSize="small"
                display={{ base: 'block', lg: 'none' }}
              >
                (Clique para copiar a chave)
              </Text>
            </Center>

            <Box textAlign={{ base: 'center', lg: 'start' }}>
              <Heading as="h2" fontSize="xl">
                Contribuições ❤️
              </Heading>

              <Text color="gray.600" fontSize="small">
                Considere realizar uma doação para auxiliar na manutenção do
                projeto. <br /> Melhorias? Envie um e-mail para{' '}
                <Link
                  href="mailto:silvanosilvino@hotmail.com"
                  fontWeight="bold"
                  textDecor="underline"
                >
                  silvanosilvino@hotmail.com
                </Link>
              </Text>
            </Box>
          </Flex>
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
