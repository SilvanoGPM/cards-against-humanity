import { usersCollection } from '@/firebase/config';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { getAny } from './core';

export async function newUser(user: User): Promise<string> {
  const { uid, displayName, email, photoURL } = user;

  await setDoc(doc(usersCollection, uid), {
    uid,
    displayName,
    email,
    photoURL,
  });

  return uid;
}

export function getUser(id: string): Promise<UserType> {
  return getAny<UserType>(usersCollection, id);
}
