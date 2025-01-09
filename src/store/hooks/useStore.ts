import { useCallback, useContext, useMemo } from 'react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { loadStore } from '../Store';
import { StoreContext } from '../StoreProvider';
import { IIIFResourceInformation } from '@/model';

export const useStore = () => {
  const { store, setStore } = useContext(StoreContext);

  // Make store reactive for selected methods
  const set = useCallback((p: Promise<void>) => p.then(() => setStore({...store })), []);
  
  const importIIIFResource = useCallback((
    info: IIIFResourceInformation, 
    folderId?: string
  ) => {
    return store.importIIIFResource(info, folderId).then(resource => {
      setStore({...store});
      return resource;
    })
  }, []);

  const deleteRelation = useCallback((linkId: string) =>
    set(store.deleteRelation(linkId)), []);

  const upsertRelation = useCallback((
    link: W3CRelationLinkAnnotation, 
    meta: W3CRelationMetaAnnotation
  ) => set(store.upsertRelation(link, meta)), []);

  const reactive = useMemo(() => store ? {
    ...store,
    importIIIFResource,
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
