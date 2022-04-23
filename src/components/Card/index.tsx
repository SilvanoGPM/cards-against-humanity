import { CARD_TOKEN } from '@/constants/globals';

import { WhiteLogo, BlackLogo } from './Logos';
import styles from './styles.module.scss';

type CardProps = Omit<CardType, 'id'>;

export function Card({ message, type }: CardProps): JSX.Element {
  const isBlack = type === 'BLACK';

  function getFormatedMessage(): string {
    const text = message.replace(
      CARD_TOKEN,
      `<span class="${styles.question}"></span>`
    );

    return `<p class="${styles.message}">${text}</p>`;
  }

  return (
    <div className={`${styles.card} ${isBlack ? styles.isBlack : ''}`}>
      <div dangerouslySetInnerHTML={{ __html: getFormatedMessage() }} />
      {isBlack ? <BlackLogo /> : <WhiteLogo />}
    </div>
  );
}
