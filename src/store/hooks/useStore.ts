import { useContext } from 'react';
import { loadStore } from '../Store';
import { StoreContext } from '../StoreProvider';

export const useStore = () => {
  const { store } = useContext(StoreContext);
  return store;
}

export const useInitStore = () => {
  const { setStore, setModel } = useContext(StoreContext);

  return (handle: FileSystemDirectoryHandle) =>
    loadStore(handle).then(store => {
      setStore(store);
      setModel(store.getDataModel());
    });
}
