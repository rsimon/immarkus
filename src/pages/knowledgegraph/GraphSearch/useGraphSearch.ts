import { useStore } from '@/store';
import { useEffect, useState } from 'react';
import { Sentence } from './Types';

export const useGraphSearch = () => {

  const store = useStore();

  const [sentence, setSentence] = useState<Partial<Sentence<any>>>({});

  const updateSentence = (part: Partial<Sentence<any>>) => {
    setSentence(prev => ({ ...prev, ...part }));
  };

  useEffect(() => {

  }, [sentence]);

  return {
    sentence, 
    updateSentence
  }
  
}