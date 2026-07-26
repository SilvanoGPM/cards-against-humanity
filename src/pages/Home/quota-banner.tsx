import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
} from '@chakra-ui/react';

interface QuotaBannerProps {
  onClose?: () => void;
}

export function QuotaBanner({ onClose }: QuotaBannerProps): JSX.Element {
  return (
    <Alert
      status="warning"
      variant="left-accent"
      borderRadius="md"
      alignItems="flex-start"
      mt="6"
    >
      <AlertIcon />

      <Box flex="1">
        <AlertTitle>Limite diário atingido</AlertTitle>

        <AlertDescription display="block">
          Nosso servidor gratuito atingiu o limite de uso de hoje, por isso não
          é possível criar ou entrar em partidas no momento. Tente novamente
          amanhã a partir das 9 horas. Obrigado pela paciência! 💛
        </AlertDescription>
      </Box>

      {onClose && (
        <CloseButton
          onClick={onClose}
          position="relative"
          right="-1"
          top="-1"
        />
      )}
    </Alert>
  );
}
