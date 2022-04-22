import { getAny } from './base';

const CARDS_PATH = 'cards';

export function getCards(): Promise<CardType[]> {
  return getAny<CardType>(CARDS_PATH);
}
