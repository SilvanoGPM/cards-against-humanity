import { initializeApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';

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
