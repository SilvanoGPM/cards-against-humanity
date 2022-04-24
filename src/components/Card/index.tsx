import { CARD_TOKEN } from '@/constants/globals';

import { WhiteLogo, BlackLogo } from './Logos';
import styles from './styles.module.scss';

interface CardProps extends Omit<CardType, 'id'> {
  className?: string;
  messageClassName?: string;
}

export function Card({
  message,
  type,
  className,
  messageClassName,
}: CardProps): JSX.Element {
  const isBlack = type === 'BLACK';

  function getFormatedMessage(): string {
    const text = message.replaceAll(
      CARD_TOKEN,
      `<span class="${styles.question}"></span>`
    );

    return `<p class="${styles.message} ${messageClassName}">${text}</p>`;
  }

  return (
    <div
      className={`${styles.card} ${isBlack ? styles.isBlack : ''} ${className}`}
    >
      <div dangerouslySetInnerHTML={{ __html: getFormatedMessage() }} />
      {isBlack ? <BlackLogo /> : <WhiteLogo />}
    </div>
  );
}
