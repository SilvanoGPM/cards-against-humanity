import { CARD_TOKEN } from '@/constants/globals';

import { WhiteLogo, BlackLogo } from './Logos';
import styles from './styles.module.scss';

interface CardProps extends Omit<CardType, 'id'> {
  className?: string;
  frontClassName?: string;
  backClassName?: string;
  messageClassName?: string;
  animationType?: 'off' | 'revert' | 'hover' | 'auto';
  animationDelay?: string;
}

const animations = {
  off: styles.cardAnimationOff,
  hover: styles.cardAnimationHover,
  auto: styles.cardAnimationAuto,
  revert: styles.cardAnimationRevert,
};

export function Card({
  message,
  type,
  animationType = 'off',
  animationDelay = '1s',
  className = '',
  messageClassName = '',
  frontClassName = '',
  backClassName = '',
}: CardProps): JSX.Element {
  const isBlack = type === 'BLACK';
  const animation = animations[animationType];

  function getFormatedMessage(): string {
    const text = message.replaceAll(
      CARD_TOKEN,
      `<span class="${styles.question}"></span>`
    );

    return `<p class="${styles.message} ${messageClassName}">${text}</p>`;
  }

  const Logo = isBlack ? BlackLogo : WhiteLogo;

  return (
    <div
      className={`${styles.card} ${isBlack ? styles.isBlack : ''} ${className}`}
    >
      <div
        className={`${styles.cardInner} ${animation}`}
        style={{ animationDelay }}
      >
        <div className={`${styles.cardFront} ${frontClassName}`}>
          <div>
            <p className={styles.gameNameText}>Cards</p>
            <p className={styles.gameNameText}>Against</p>
            <p className={styles.gameNameText}>Humanity</p>
          </div>
          <Logo />
        </div>

        <div className={`${styles.cardBack} ${backClassName}`}>
          <div dangerouslySetInnerHTML={{ __html: getFormatedMessage() }} />
          <Logo />
        </div>
      </div>
    </div>
  );
}
