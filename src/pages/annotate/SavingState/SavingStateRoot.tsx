import { ReactNode, createContext, useState } from 'react';
import { SavingStateValue } from './SavingStateValue';

interface SavingStateContextValue {

  savingState: { value: SavingStateValue, message?: string };

  setSavingState: React.Dispatch<React.SetStateAction<{ value: SavingStateValue, message?: string }>>

}

// @ts-ignore
export const SavingStateContext = createContext<SavingStateContextValue>();

export const SavingStateRoot = (props: { children: ReactNode }) => {

  const [savingState, setSavingState] = useState<{ value: SavingStateValue, message?: string}>({ value: 'idle' });

  return (
    <SavingStateContext.Provider value={{ savingState, setSavingState }}>
      {props.children}
    </SavingStateContext.Provider>
  )

}