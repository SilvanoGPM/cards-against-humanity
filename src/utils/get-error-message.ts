export function getErrorMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  defaultMessage = 'Aconteceu um erro'
) {
  return error?.message || defaultMessage;
}
