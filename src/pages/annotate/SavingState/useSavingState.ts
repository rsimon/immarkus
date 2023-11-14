import { useContext } from 'react';
import { SavingStateContext } from './SavingStateRoot';

export const useSavingState = () => useContext(SavingStateContext);
