import { useEffect, useState } from 'react';
import { indexExists } from 'browser-visual-search';
import { useStore } from '@/store';

export const useVisualSearchAvailable = () => {

  const store = useStore();

  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!store) return;
    indexExists(store.getRootFolder().handle).then(setAvailable);
  }, [store]);

  return available;

}