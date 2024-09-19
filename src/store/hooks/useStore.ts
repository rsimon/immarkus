import { useContext, useMemo } from 'react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { loadStore } from '../Store';
import { StoreContext } from '../StoreProvider';

export const useStore = () => {
  const { store, setStore } = useContext(StoreContext);
  
  const deleteRelation = (linkId: string) =>
    set(store.deleteRelation(linkId));

  const upsertRelation = (
    link: W3CRelationLinkAnnotation, 
    meta: W3CRelationMetaAnnotation
  ) =>
    set(store.upsertRelation(link, meta));

  // Make store reactive for selected methods
  const set = (p: Promise<void>) => p.then(() => setStore({...store }));
  
  const reactive = useMemo(() => store ? {
    ...store,
    deleteRelation,
    upsertRelation
  } : undefined, [store]);

  return reactive;
  
}

export const useInitStore = () => {
  const { setStore, setModel } = useContext(StoreContext);

  return (handle: FileSystemDirectoryHandle) =>
    loadStore(handle).then(store => {
      setStore(store);
      setModel(store.getDataModel());
    });
}
