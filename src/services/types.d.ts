interface CardType {
  id: string;
  type: 'BLACK' | 'WHITE';
  message: string;
}

interface AnswersType {
  user: string;
  card: CollectionReference<CardType>;
}

interface UserPlayedType {
  name: string;
  cards: CollectionReference<CardType>[];
}

interface RoundType {
  question: CollectionReference<CardType>;
  answers: AnswersType[];
  usersWhoPlayed: UserPlayed[];
}

interface MatchType {
  id: string;
  status: 'FINISHED' | 'PLAYING';
  rounds: RoundType[];
  users: string[];
  owner: string;
}
