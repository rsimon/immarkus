import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressHandler, Store, loadStore } from './store';

interface StoreContextState {

  store?: Store;

  setStore: React.Dispatch<React.SetStateAction<Store | undefined>>

}

//@ts-ignore
const StoreContext = createContext<StoreContextState>(undefined);

interface StoreProviderProps {

  children: ReactNode;

}

export const StoreProvider = (props: StoreProviderProps) => {

  const [store, setStore] = useState<Store | undefined>(undefined);

  return (
    <StoreContext.Provider value={{ store, setStore }}>
      {props.children}
    </StoreContext.Provider>
  )

}

export const useInitStore = () => {
  const { setStore } = useContext(StoreContext);

  return (handle: FileSystemDirectoryHandle, onProgress?: ProgressHandler) =>
    loadStore(handle, onProgress).then(store => {
      setStore(store);
    })
}

export const useStore = (args: { redirect: boolean } = { redirect: false }) => {
  const { store } = useContext(StoreContext);

  const navigate = args.redirect && useNavigate();

  useEffect(() => {
    if (!store && navigate)
      navigate('/');
  }, []);

  return store;
}