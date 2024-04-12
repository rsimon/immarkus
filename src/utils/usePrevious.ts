import { useEffect, useRef } from 'react';

export const usePrevious = <T extends unknown>(value: any) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]); 

  return ref.current as T;
}