import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Button,
  FormGroup,
  H3,
  Radio,
  RadioGroup,
  TextArea,
} from '@blueprintjs/core';

import { Card } from '@/components/Card';
import { newCard } from '@/services/cards';
import { GoBack } from '@/components/GoBack';
import { AppToaster } from '@/components/Toast';

import styles from './styles.module.scss';

type CardSupportedTypes = 'WHITE' | 'BLACK';

const INITIAL_CARD = {
  message: '',
  type: 'WHITE' as CardSupportedTypes,
};

export function NewCard(): JSX.Element {
  const [card, setCard] = useState<Omit<CardType, 'id'>>(INITIAL_CARD);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();

    const { message, type } = event.target as typeof event.target & {
      message: { value: string };
      type: { value: string };
    };

    setCard({ message: message.value, type: type.value as CardSupportedTypes });
  }

  function handleMessageChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const { value } = event.target;
    setCard({ ...card, message: value });
  }

  function handleRadioChange(event: FormEvent<HTMLInputElement>): void {
    const { value } = event.currentTarget;
    setCard({ ...card, type: value as CardSupportedTypes });
  }

  async function handleNewCard(): Promise<void> {
    if (card && card.message && card.type) {
      await newCard(card);

      AppToaster.show({
        intent: 'success',
        message: 'Carta adicionada com sucesso!',
      });

      formRef.current?.reset();
      setCard(INITIAL_CARD);

      return;
    }

    AppToaster.show({
      intent: 'primary',
      message: 'Insira uma mensagem para a carta',
    });
  }

  return (
    <section className={styles.container}>
      <div className={styles.goBack}>
        <GoBack />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <FormGroup className={styles.inputGroup} label="Texto da carta:">
          <TextArea
            id="message"
            name="message"
            onChange={handleMessageChange}
            className={styles.textarea}
          />
        </FormGroup>

        <div className={styles.inputGroup}>
          <RadioGroup
            selectedValue={card.type}
            onChange={handleRadioChange}
            inline
            label="Tipo da carta"
            name="type"
          >
            <Radio label="Resposta" value="WHITE" />

            <Radio label="Pergunta" value="BLACK" />
          </RadioGroup>

          <Button
            className={styles.button}
            intent="success"
            type="submit"
            onClick={handleNewCard}
          >
            Criar carta
          </Button>

          <Link to="/cards">
            <Button className={styles.button} intent="primary" type="button">
              Visualizar cartas
            </Button>
          </Link>
        </div>
      </form>

      <div className={styles.card}>
        <H3>Preview da carta</H3>
        <Card {...card} />
      </div>
    </section>
  );
}
