import { useEffect, useState } from 'react';

import {
  Button,
  Container,
  Flex,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';

import { addDoc } from 'firebase/firestore';

import { createCollection } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = '@CARDS_AGAINST_HUMANITY/CARDS';

interface CachedCard {
  type: string;
  message: string;
  id: string;
}

function hasValidCache(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) return false;

    const isValidShape = parsed.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        'message' in item &&
        'id' in item &&
        typeof (item as CachedCard).type === 'string' &&
        typeof (item as CachedCard).message === 'string' &&
        typeof (item as CachedCard).id === 'string'
    );

    if (!isValidShape) return false;

    const allHacked = (parsed as CachedCard[]).every(
      (card) => card.message === 'o sul'
    );

    return !allHacked;
  } catch {
    return false;
  }
}

const recoveryCollection = createCollection('recovery');

export function HackedAlert(): JSX.Element {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cacheAvailable, setCacheAvailable] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setCacheAvailable(hasValidCache());
  }, []);

  async function handleSendCache(): Promise<void> {
    setSending(true);

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const cards: CachedCard[] = JSON.parse(raw!);

      await addDoc(recoveryCollection, {
        cards,
        sentAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        userId: user?.uid ?? null,
        userEmail: user?.email ?? null,
      });

      setSent(true);
      toast({
        title: 'Cache enviado com sucesso!',
        description: 'Obrigado por ajudar na recuperação das cartas.',
        status: 'success',
        duration: 5000,
      });
    } catch (e) {
      console.log(e);

      toast({
        title: 'Erro ao enviar cache',
        description: 'Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Container maxW="600px" minH="100vh">
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        gap="6"
        textAlign="center"
        p="4"
      >
        <img alt="" width="64" src="./src/favicon.png" />

        <Heading size="xl" textTransform="uppercase">
          Fomos hackeados 😢
        </Heading>

        <Text fontSize="lg">
          Por pura burrice e preguiça do desenvolvedor, o site foi hackeado.
          Sim, a culpa é dele mesmo. Não tem nem como defender.
        </Text>

        <Text>
          O resultado? Alguém invadiu o banco de dados e substituiu o texto de{' '}
          <strong>TODAS</strong> as cartas por &quot;o sul&quot;. Isso mesmo.
          Cada carta do jogo agora diz apenas &quot;o sul&quot;. Imagina a
          rodada: &quot;o sul&quot;, &quot;o sul&quot;, &quot;o sul&quot;...
          muito divertido né?
        </Text>

        <Text>
          Mas você pode salvar o dia! As cartas ficavam salvas no cache do seu
          navegador, e pode ser que o seu ainda tenha a coleção original antes
          da invasão. Basta clicar no botão abaixo para nos enviar esses dados e
          a gente tenta recuperar o que foi perdido.
        </Text>

        {sent ? (
          <Text fontWeight="bold" mt="4">
            Obrigado pela sua contribuição! Vamos analisar os dados enviados.
          </Text>
        ) : cacheAvailable ? (
          <Button
            variant="default"
            size="lg"
            mt="4"
            onClick={handleSendCache}
            isLoading={sending}
            loadingText="Enviando..."
          >
            Enviar cache para recuperação
          </Button>
        ) : (
          <Text mt="4" color="gray.500">
            Infelizmente não encontramos cartas válidas no cache deste
            navegador.
          </Text>
        )}
      </Flex>
    </Container>
  );
}
