import { useNavigate } from 'react-router-dom';

import { Icon, IconButton, IconButtonProps } from '@chakra-ui/react';

import { FaArrowLeft } from 'react-icons/fa';

interface GoBackProps extends Omit<IconButtonProps, 'aria-label'> {
  toHome?: boolean;
}

export function GoBack({ toHome = false, ...props }: GoBackProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <IconButton
      aria-label="Voltar"
      onClick={() => (toHome ? navigate('/') : navigate(-1))}
      icon={<Icon as={FaArrowLeft} />}
      {...props}
    />
  );
}
