import avatar from '../../assets/avatar.png';

interface AvatarProps {
  alt: string;
  src?: string | null;
  containerClassName?: string;
  className?: string;
}

export function Avatar({
  containerClassName,
  className,
  alt,
  src,
}: AvatarProps): JSX.Element {
  return (
    <figure className={containerClassName}>
      <img
        style={{ width: '100%', height: '100%' }}
        className={className}
        title={alt}
        alt={alt}
        src={src || avatar}
        onError={(event) => {
          // eslint-disable-next-line
          event.currentTarget.src = avatar;
        }}
      />
    </figure>
  );
}
