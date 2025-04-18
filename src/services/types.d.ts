interface UserType {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  wins?: number;
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

interface UserVotedType {
  user: import('firebase/firestore').DocumentReference<UserType>;
  votedUser: import('firebase/firestore').DocumentReference<UserType>;
}

interface DeckType {
  cards: import('firebase/firestore').DocumentReference<CardType>[];
  user: import('firebase/firestore').DocumentReference<UserType>;
}

interface RoundType {
  question: import('firebase/firestore').DocumentReference<CardType>;
  answers: AnswersType[];
  usersWhoPlayed: UserPlayedType[];
  usersWhoVoted: UserVotedType[];
  decks: DeckType[];
}

interface MatchMessage {
  id: string;
  userName: string;
  userAvatar?: string;
  message: string;
  createdAt: Timestamp;
}

interface MatchUserPoints {
  userId: string;
  value: number;
}

interface MatchType {
  id: string;
  status: 'FINISHED' | 'PLAYING' | 'LOADING';
  type: 'PUBLIC' | 'PRIVATE';
  rounds: number;
  actualRound?: RoundType | null;
  users: import('firebase/firestore').DocumentReference<UserType>[];
  owner: import('firebase/firestore').DocumentReference<UserType>;
  points: MatchUserPoints[];
  messages: MatchMessage[];

  winner?: import('firebase/firestore').DocumentReference<UserType>;

  pointsToWin: number;
  shouldShowCardOwner?: boolean;
  createdAt?: Timestamp;
}

interface GeneralType {
  canPlay: boolean;
  totalCards: number;
}

interface AnswersConvertedType {
  user: UserType;
  card: CardType;
}

interface UserPlayedConvertedType {
  user: UserType;
}

interface UserVotedConvertedType {
  user: UserType;
  votedUser: UserType;
}

interface DeckConvertedType {
  user: UserType;
  cards: CardType[];
}

interface RoundConvertedType {
  question: CardType;
  usersWhoPlayed: UserPlayedConvertedType[];
  usersWhoVoted: UserVotedConvertedType[];
  answers: AnswersConvertedType[];
  decks: DeckConvertedType[];
}

interface MatchConvertedType
  extends Omit<MatchType, 'users' | 'owner' | 'actualRound'> {
  users: UserType[];
  owner: UserType;
  winner: UserType | null;
  rounds: number;
  actualRound?: RoundConvertedType | null;
}
