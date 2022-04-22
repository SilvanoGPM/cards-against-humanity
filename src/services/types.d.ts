interface MatchType {
  status: 'FINISHED' | 'PLAYING';
  questions: [];
  users: string[];
}

interface CardType {
  type: 'BLACK' | 'WHITE';
  message: string;
}
