import styles from './styles.module.scss';

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  variant?: 'full' | 'outlined';
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

export function Button({
  variant = 'full',
  type = 'button',
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      {...props}
      className={`${styles.button} ${props.className} ${
        variant === 'outlined' ? styles.outlined : ''
      }`}
      type={type}
    >
      {children}
    </button>
  );
}
