import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/get-error-message';

import { Button, ButtonProps, Icon, useToast } from '@chakra-ui/react';

import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export function LoginButton({
  onLoginError,
  ...props
}: ButtonProps & { onLoginError?: () => void }) {
  const toast = useToast();
  const { handleLogin } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleLogin(): Promise<void> {
    try {
      setIsLoading(true);
      await handleLogin();
    } catch (error) {
      console.error('error', error);

      const description = getErrorMessage(
        error,
        'Não foi possível realizar login.'
      );

      toast({
        description,
        title: 'Aconteceu um erro',
        status: 'error',
      });

      onLoginError?.();
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
