import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { newCard } from '@/services/cards';

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

  function handleRadioChange(event: ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target;
    setCard({ ...card, type: value as 'BLACK' | 'WHITE' });
  }

  async function handleNewCard(): Promise<void> {
    if (card && card.message && card.type) {
      await newCard(card);
      navigate('/cards');
    }
  }

  return (
    <section className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="message">
            Create new card
            <textarea
              id="message"
              name="message"
              onChange={handleMessageChange}
            />
          </label>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="white">
            White
            <input
              id="white"
              name="type"
              value="WHITE"
              type="radio"
              onChange={handleRadioChange}
            />
          </label>

          <label htmlFor="black">
            Black
            <input
              id="black"
              name="type"
              value="BLACK"
              type="radio"
              onChange={handleRadioChange}
            />
          </label>
        </div>

        <div>
          <Button
            style={{ width: '100%' }}
            variant="outlined"
            type="submit"
            onClick={handleNewCard}
          >
            Create
          </Button>
        </div>
      </form>

      <div>
        <h3>Preview</h3>
        <Card {...card} />
      </div>
    </section>
  );
}
