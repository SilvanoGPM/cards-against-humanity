export function countString(word: string, token: string): number {
  return word.split(token).length - 1;
}
