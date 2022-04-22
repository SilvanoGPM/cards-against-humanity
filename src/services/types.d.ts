interface MatchType {
  status: 'FINISHED' | 'PLAYING';
  questions: [];
  users: string[];
  owner: string;
}

interface CardType {
  type: 'BLACK' | 'WHITE';
  message: string;
}
