import { ReactNode, createContext, useState } from 'react';
import { Store } from './Store';
import { DataModelStore } from './datamodel';
import { SettingsStore } from './settings';

interface StoreContextState {

  store?: Store;

  setStore: React.Dispatch<React.SetStateAction<Store>>;

  model: DataModelStore;

  setModel: React.Dispatch<React.SetStateAction<DataModelStore>>;

  settings?: SettingsStore;

  setSettings: React.Dispatch<React.SetStateAction<SettingsStore>>;

}

export const StoreContext = createContext<StoreContextState>(undefined);

interface StoreProviderProps {

  children: ReactNode;

}

export const StoreProvider = (props: StoreProviderProps) => {

  const [store, setStore] = useState<Store | undefined>(undefined);

  const [model, setModel] = useState<DataModelStore>(undefined);

  const [settings, setSettings] = useState<SettingsStore>(undefined);

  return (
    <StoreContext.Provider 
      value={{ store, setStore, model, setModel, settings, setSettings }}>
      {props.children}
    </StoreContext.Provider>
  )

}