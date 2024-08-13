import { CARD_TOKEN } from '@/constants/globals';
import { useState } from 'react';

import { WhiteLogo, BlackLogo } from './Logos';
import styles from './styles.module.scss';

interface CardProps extends Omit<CardType, 'id'> {
  className?: string;
  frontClassName?: string;
  backClassName?: string;
  messageClassName?: string;
  animationType?: 'off' | 'revert' | 'hover' | 'auto' | 'rotating' | 'click';
  animationDelay?: string;
  animationClickShowBack?: boolean;
}

const animations = {
  off: styles.cardAnimationOff,
  hover: styles.cardAnimationHover,
  auto: styles.cardAnimationAuto,
  revert: styles.cardAnimationRevert,
  rotating: styles.cardAnimationRotating,
  click: styles.cardAnimationClick,
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
  animationClickShowBack = false,
}: CardProps): JSX.Element {
  const [clicked, setClicked] = useState(animationClickShowBack);

  const isBlack = type === 'BLACK';
  const animation = animations[animationType];

  function getFormatedMessage(): string {
    const text =
      message?.replaceAll(
        CARD_TOKEN,
        `<span class="${styles.question}"></span>`
      ) || '';

    return `<p class="${styles.message} ${messageClassName}">${text}</p>`;
  }

  function toggleClicked(): void {
    if (animationType === 'click') {
      setClicked(!clicked);
    }
  }

  const Logo = isBlack ? BlackLogo : WhiteLogo;

  return (
    <button
      onClick={toggleClicked}
      className={`${styles.card} ${isBlack ? styles.isBlack : ''} ${className}`}
    >
      <div
        className={`${styles.cardInner} ${
          animationType !== 'click' ? animation : clicked ? animation : ''
        }`}
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
    </button>
  );
}
