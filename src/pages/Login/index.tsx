import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@blueprintjs/core';
import { FcGoogle } from 'react-icons/fc';

import { useAuth } from '@/contexts/AuthContext';
import { useBoolean } from '@/hooks/useBoolean';
import { AppToaster } from '@/components/Toast';

import styles from './styles.module.scss';

export function Login(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleLogin, authenticated } = useAuth();

  const [loading, startLoading, stopLoading] = useBoolean(false);

  useEffect(() => {
    if (authenticated) {
      const { path } = location.state as { path: string };
      navigate(path || '/');
    }
  }, [authenticated, navigate, location]);

  async function handleLoginClick(): Promise<void> {
    try {
      startLoading();
      await handleLogin();
      navigate('/');
    } catch {
      AppToaster.show({
        message: 'Aconteceu um erro ao tentar fazer login.',
        intent: 'danger',
        icon: 'error',
      });
    } finally {
      stopLoading();
    }
  }

  return (
    <section className={styles.container}>
      <Button
        icon={<FcGoogle />}
        onClick={handleLoginClick}
        className={styles.googleButton}
        loading={loading}
        outlined
      >
        Login com Google
      </Button>
    </section>
  );
}
