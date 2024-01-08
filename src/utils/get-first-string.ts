export function getFirstString(
  str: string | undefined | null,
  delimiter = ' '
): string {
  return str?.split(delimiter)[0] || '';
}
