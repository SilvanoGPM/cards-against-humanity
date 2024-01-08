import { useAuth } from '@/contexts/AuthContext';

import { Button, ButtonProps, Icon, useToast } from '@chakra-ui/react';

import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export function LoginButton(props: ButtonProps) {
  const toast = useToast();
  const { handleLogin } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin(): Promise<void> {
    try {
      setIsLoading(true);
      await handleLogin();
    } catch {
      toast({
        title: 'Aconteceu um erro',
        description: 'Não foi possível realizar login.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      leftIcon={<Icon as={FcGoogle} />}
      onClick={handleGoogleLogin}
      isLoading={isLoading}
      variant="defaultOutlined"
      {...props}
    >
      Login com Google
    </Button>
  );
}
