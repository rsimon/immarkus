import { usePersistentState } from '@/utils/usePersistentState';

const KEY = 'immarkus:annotate:ai-opt-in';

export const useOptIn = () => {

  const [optIn, setOptIn] = usePersistentState(KEY, false);

  return [optIn, setOptIn] as const;

}