import {
  collection,
  getDocs,
  addDoc,
  CollectionReference,
  DocumentData,
} from 'firebase/firestore';

import { db } from '../firebase';

export function getCollection(path: string): CollectionReference<DocumentData> {
  return collection(db, path);
}

export async function getAny<T>(path: string): Promise<T[]> {
  const data = await getDocs(getCollection(path));

  const values = data.docs.map<T>((doc) => ({ ...doc.data() } as T));

  return values;
}

export async function createAny<T>(path: string, data: T): Promise<string> {
  const created = await addDoc(getCollection(path), data);
  return created.id;
}
