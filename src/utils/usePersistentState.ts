import { useEffect, useState } from 'react';

const parseValue = <T>(str: string): T => {
  if (!str) return;

  try {
    const parsed = JSON.parse(str) as T;
    return parsed;
  } catch (error) {
    console.error('Error parsing stored state', error);
  }
}

export const usePersistentState = <T>(key: string, defaultValue?: T) => {

  const [value, setValue] = useState<T>(parseValue(localStorage.getItem(key)) || defaultValue);

  useEffect(() => {
    const value = parseValue<T>(localStorage.getItem(key));
    if (value)
      setValue(value);
  }, [key]);

  useEffect(() => {
    if (value === undefined)
      localStorage.removeItem(key);
    else
      localStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue] as const;

}