import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export function NewCard(): JSX.Element {
  const navigate = useNavigate();

  const [card, setCard] = useState<Omit<CardType, 'id'>>({
    message: '',
    type: 'WHITE',
  });

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();

    const { message, type } = event.target as typeof event.target & {
      message: { value: string };
      type: { value: string };
    };

    setCard({ message: message.value, type: type.value as 'BLACK' | 'WHITE' });
  }

  function handleMessageChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    const { value } = event.target;
    setCard({ ...card, message: value });
  }

  function handleRadioChange(event: FormEvent<HTMLInputElement>): void {
    const { value } = event.currentTarget;
    setCard({ ...card, type: value as 'BLACK' | 'WHITE' });
  }

  async function handleNewCard(): Promise<void> {
    if (card && card.message && card.type) {
      await newCard(card);
      navigate('/cards');
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

      <form onSubmit={handleSubmit} className={styles.form}>
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
            className={styles.newCard}
            intent="success"
            type="submit"
            onClick={handleNewCard}
          >
            Criar carta
          </Button>
        </div>
      </form>

      <div className={styles.card}>
        <H3>Preview da carta</H3>
        <Card {...card} />
      </div>
    </section>
  );
}
