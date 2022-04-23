import { useEffect, useState } from 'react';

import Repository from '@/lib/Repository';

type UseStorageReturn<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  boolean
];

export function useStorage<T>(
  key: string,
  initialValue: T
): UseStorageReturn<T> {
  const [loading, setLoading] = useState<boolean>(true);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    async function loadStoredValue(): Promise<void> {
      const valueFound = await Repository.get<T>(key);

      if (valueFound !== undefined && valueFound !== null) {
        setStoredValue(valueFound);
      }

      setLoading(false);
    }

    loadStoredValue();
  }, [key]);

  useEffect(() => {
    async function storeValue(): Promise<void> {
      await Repository.save<T>(key, storedValue);
    }

    if (!loading) {
      storeValue();
    }
  }, [storedValue, loading, key]);

  return [storedValue, setStoredValue, loading];
}
