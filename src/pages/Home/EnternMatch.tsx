import { Button, H2, InputGroup } from '@blueprintjs/core';
import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppToaster } from '@/components/Toast';
import { Ad } from '@/components/Ad';

import styles from './styles.module.scss';

export function EnterInMatch(): JSX.Element {
  const navigate = useNavigate();

  function handleLogin(event: FormEvent): void {
    event.preventDefault();

    const { id } = event.target as typeof event.target & {
      id: { value: string };
    };

    const formattedId = id.value.trim();

    if (formattedId) {
      navigate(`/match/${formattedId}`);
      return;
    }

    AppToaster.show({ intent: 'primary', message: 'Insira um ID válido' });
  }

  return (
    <section className={styles.enterMatch}>
      <div>
        <H2>Entrar em uma partida</H2>
        <form onSubmit={handleLogin} className={styles.form}>
          <InputGroup
            name="id"
            id="id"
            placeholder="Id da partida"
            className={styles.enterInputMatch}
          />

          <Button intent="success" type="submit" rightIcon="key-enter">
            Entrar
          </Button>
        </form>
      </div>

      <div className={styles.ad}>
        <Ad />
      </div>
    </section>
  );
}
