export const fakeMatch = {
  messages: [],
  id: '1',
  owner: {
    displayName: 'test',
    email: 'test',
    photoURL: 'test',
    uid: 'test',
  },
  pointsToWin: 20,
  winner: null,
  points: [],
  createdAt: new Date(),
  shouldShowCardOwner: false,
  rounds: 3,
  status: 'PLAYING',
  type: 'PRIVATE',
  users: [],
  actualRound: {
    decks: [],
    question: {
      id: '1',
      message: 'Teste',
      type: 'BLACK',
    },
    usersWhoVoted: [],
    usersWhoPlayed: [
      {
        user: {
          displayName: 'test',
          email: 'test',
          photoURL: 'test',
          uid: 'test',
        },
      },
    ],
    answers: [
      {
        card: {
          id: '1',
          message: 'Teste',
          type: 'WHITE',
        },
        user: {
          displayName: 'test',
          email: 'test',
          photoURL: 'test',
          uid: 'test',
        },
      },

      {
        card: {
          id: '1',
          message: 'Teste',
          type: 'WHITE',
        },
        user: {
          displayName: 'test',
          email: 'test',
          photoURL: 'test',
          uid: 'test',
        },
      },

      {
        card: {
          id: '1',
          message: 'Teste',
          type: 'WHITE',
        },
        user: {
          displayName: 'test',
          email: 'test',
          photoURL: 'test',
          uid: 'test',
        },
      },
      {
        card: {
          id: '2',
          message: 'Teste2',
          type: 'WHITE',
        },
        user: {
          displayName: 'test2',
          email: 'test2',
          photoURL: 'test2',
          uid: 'test2',
        },
      },
      {
        card: {
          id: '2',
          message: 'Teste2',
          type: 'WHITE',
        },
        user: {
          displayName: 'test2',
          email: 'test2',
          photoURL: 'test2',
          uid: 'test2',
        },
      },
      {
        card: {
          id: '2',
          message: 'Teste2',
          type: 'WHITE',
        },
        user: {
          displayName: 'test2',
          email: 'test2',
          photoURL: 'test2',
          uid: 'test2',
        },
      },
    ],
  },
} as MatchConvertedType;
