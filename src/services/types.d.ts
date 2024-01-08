interface UserType {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface CardType {
  id: string;
  type: 'BLACK' | 'WHITE';
  message: string;
}

type CardToCreate = Omit<CardType, 'id'>;

interface AnswersType {
  user: import('firebase/firestore').DocumentReference<UserType>;
  card: import('firebase/firestore').DocumentReference<CardType>;
}

interface UserPlayedType {
  user: import('firebase/firestore').DocumentReference<UserType>;
}

interface DeckType {
  cards: import('firebase/firestore').DocumentReference<CardType>[];
  user: import('firebase/firestore').DocumentReference<UserType>;
}

interface RoundType {
  question: import('firebase/firestore').DocumentReference<CardType>;
  answers: AnswersType[];
  usersWhoPlayed: UserPlayedType[];
  decks: DeckType[];
}

interface MatchType {
  id: string;
  status: 'FINISHED' | 'PLAYING';
  rounds: number;
  actualRound?: RoundType | null;
  users: import('firebase/firestore').DocumentReference<UserType>[];
  owner: import('firebase/firestore').DocumentReference<UserType>;
}

interface AnswersConvertedType {
  user: UserType;
  card: CardType;
}

interface UserPlayedConvertedType {
  user: UserType;
}

interface DeckConvertedType {
  user: UserType;
  cards: CardType[];
}

interface RoundConvertedType {
  question: CardType;
  usersWhoPlayed: UserPlayedConvertedType[];
  answers: AnswersConvertedType[];
  decks: DeckConvertedType[];
}

interface MatchConvertedType
  extends Omit<MatchType, 'users' | 'owner' | 'actualRound'> {
  users: UserType[];
  owner: UserType;
  rounds: number;
  actualRound?: RoundConvertedType | null;
}
