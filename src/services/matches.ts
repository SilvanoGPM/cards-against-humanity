import { createAny, getAny } from './base';

const MATCHES_PATH = 'matches';

export function getMatches(): Promise<MatchType[]> {
  return getAny<MatchType>(MATCHES_PATH);
}

export function newMatch(user: string): Promise<string> {
  return createAny<MatchType>(MATCHES_PATH, {
    questions: [],
    status: 'PLAYING',
    users: [user],
  });
}
