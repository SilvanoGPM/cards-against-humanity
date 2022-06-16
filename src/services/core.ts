import {
  getDocs,
  addDoc,
  CollectionReference,
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
  DocumentSnapshot,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

export function toValue<T>(doc: QueryDocumentSnapshot<T>): T {
  return { ...doc.data(), id: doc.id } as T;
}

export function mapValue<T>(data: QuerySnapshot<T>): T[] {
  return data.docs.map<T>(toValue);
}

export async function getAll<T>(
  collection: CollectionReference<T>
): Promise<T[]> {
  const data = await getDocs(collection);
  return mapValue(data);
}

export async function getAny<T>(
  collection: CollectionReference<T>,
  id: string
): Promise<T> {
  const data = doc(collection, id);

  const found = await getDoc(data);

  return found.exists() ? ({ ...found.data(), id } as T) : ({} as T);
}

export async function createAny<T>(
  collection: CollectionReference<T>,
  data: T
): Promise<string> {
  const created = await addDoc(collection, data);
  return created.id;
}

export async function streamAny<T>(
  collection: CollectionReference<T>,
  id: string,
  callback: (snapshot: DocumentSnapshot<T>) => void
): Promise<Unsubscribe> {
  const unsubscribe = onSnapshot(doc(collection, id), callback);

  return unsubscribe;
}
