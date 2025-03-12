import { useCallback, useContext, useMemo } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { loadStore } from '../Store';
import { StoreContext } from '../StoreProvider';
import { IIIFResource, IIIFResourceInformation } from '@/model';

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

  const removeIIIFResource = useCallback((resource: IIIFResource) =>
    set(store.removeIIIFResource(resource)), []); 

  const deleteAnnotation = useCallback((imageId: string, annotation: W3CAnnotation) => 
    set(store.deleteAnnotation(imageId, annotation)), []);

  const deleteRelation = useCallback((linkId: string) =>
    set(store.deleteRelation(linkId)), []);

  const upsertRelation = useCallback((
    link: W3CRelationLinkAnnotation, 
    meta: W3CRelationMetaAnnotation
  ) => set(store.upsertRelation(link, meta)), []);

  const reactive = useMemo(() => store ? {
    ...store,
    deleteAnnotation,
    deleteRelation,
    importIIIFResource,
    removeIIIFResource,
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
