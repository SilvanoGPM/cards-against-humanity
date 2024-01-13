export function getErrorMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  defaultMessage = 'Aconteceu um erro'
) {
  if (error.code === 'resource-exhausted') {
    return 'Limite diário do servidor foi atingido, volte amanhã a partir das 9 horas.';
  }

  return error?.message || defaultMessage;
}
