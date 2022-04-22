import { useCallback, useState } from 'react';

type UseBooleanReturn = [
  boolean,
  () => void,
  () => void,
  (value: boolean) => void
];

export function useBoolean(initalValue: boolean): UseBooleanReturn {
  const [value, setValue] = useState(initalValue);

  const setTrueValue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalseValue = useCallback(() => {
    setValue(false);
  }, []);

  return [value, setTrueValue, setFalseValue, setValue];
}
