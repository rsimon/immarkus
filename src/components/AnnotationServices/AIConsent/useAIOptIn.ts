import { usePersistentState } from '@/utils/usePersistentState';

const KEY_BASE = 'immarkus:annotate:ai-opt-in';

export const useAIOptIn = (key: string) => {

  const [optIn, setOptIn] = usePersistentState(`${KEY_BASE}:${key}`, false);

  return [optIn, setOptIn] as const;

}