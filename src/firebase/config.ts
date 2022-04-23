import { initializeApp } from 'firebase/app';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';

import {
  DocumentData,
  getFirestore,
  collection,
  CollectionReference,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCJh45lbjhCek0BP30K7YvSK-hG-8SeWa0',
  authDomain: 'cards-against-humanity-16605.firebaseapp.com',
  projectId: 'cards-against-humanity-16605',
  storageBucket: 'cards-against-humanity-16605.appspot.com',
  messagingSenderId: '1094359847041',
  appId: '1:1094359847041:web:a8ecc0bd327d85ee5f3d80',
  measurementId: 'G-2GNVB3MBHM',
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export function createCollection<T = DocumentData>(
  collectionName: string
): CollectionReference<T> {
  return collection(db, collectionName) as CollectionReference<T>;
}
export const matchesCollection = createCollection<MatchType>('matches');
export const cardsCollection = createCollection<CardType>('cards');

export const authProvider = new GoogleAuthProvider();
export const auth = getAuth();

export async function login(): Promise<UserCredential> {
  return signInWithPopup(auth, authProvider);
}
