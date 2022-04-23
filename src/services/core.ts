import {
  getDocs,
  addDoc,
  CollectionReference,
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
  DocumentSnapshot,
} from 'firebase/firestore';

export async function getAll<T extends { id: string }>(
  collection: CollectionReference<T>
): Promise<T[]> {
  const data = await getDocs(collection);

  const values = data.docs.map<T>(
    (doc) => ({ ...doc.data(), id: doc.id } as T)
  );

  return values;
}

export async function getAny<T>(
  collection: CollectionReference<T>,
  id: string
): Promise<T> {
  const data = doc(collection, id);

  const found = await getDoc(data);

  return found.exists() ? found.data() : ({} as T);
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
