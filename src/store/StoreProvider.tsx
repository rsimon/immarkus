import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { EntityType, LoadedImage, Tag } from '@/model';
import { Store, loadStore } from './Store';
import { DataModel } from './DataModel';

interface StoreContextState {

  store?: Store;

  setStore: React.Dispatch<React.SetStateAction<Store>>;

  model: DataModel;

  setModel: React.Dispatch<React.SetStateAction<DataModel>>;

}

const StoreContext = createContext<StoreContextState>(undefined);

interface StoreProviderProps {

  children: ReactNode;

}

export const StoreProvider = (props: StoreProviderProps) => {

  const [store, setStore] = useState<Store | undefined>(undefined);

  const [model, setModel] = useState<DataModel>(undefined);

  return (
    <StoreContext.Provider value={{ store, setStore, model, setModel }}>
      {props.children}
    </StoreContext.Provider>
  )

}

export const useInitStore = () => {
  const { setStore, setModel } = useContext(StoreContext);

  return (handle: FileSystemDirectoryHandle) =>
    loadStore(handle).then(store => {
      setStore(store);
      setModel(store.getDataModel());
    });
}

export const useStore = () => {
  const { store } = useContext(StoreContext);
  return store;
}

export const useImages = (
  imageIdOrIds: string | string[],
  delay?: number
): LoadedImage | LoadedImage[] => {
  const store = useStore();

  const imageIds = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];

  const [images, setImages] = useState<LoadedImage[]>([]);

  useEffect(() => {
    const load = () => {
      const promises = imageIds.map(id => store.loadImage(id));
      Promise.all(promises).then(setImages);
    }

    if (store) {
      if (delay)
        setTimeout(() => load(), delay);
      else
        load();
    }
  }, [imageIds.join(','), store]);

  return Array.isArray(imageIdOrIds) ? images : images.length > 0 ? images[0] : undefined;
}

export const useAnnotations = (imageId: string): W3CAnnotation[] => {
  const store = useStore();

  const [annotations, setAnnotations] = useState<W3CAnnotation[]>([]);

  useEffect(() => {
    store.getAnnotations(imageId).then(setAnnotations);
  }, [imageId]);

  return annotations;
}

export const useDataModel = () => {

  const { store, model, setModel } = useContext(StoreContext);

  const setAsync = (p: Promise<void>) =>
    p.then(() => setModel(store.getDataModel()));

  const addEntityType = (type: EntityType) =>
    setAsync(store.addEntityType(type));

  const updateEntityType = (type: EntityType) => 
    setAsync(store.updateEntityType(type));

  const removeEntityType = (typeOrId: EntityType | string) =>
    setAsync(store.removeEntityType(typeOrId));

  const getEntityType = (id: string, inheritProps: boolean = true) => 
    store.getEntityType(id, inheritProps);

  const addTag = (tag: Tag) =>
    setAsync(store.addTag(tag));

  const removeTag = (tag: Tag) =>
    setAsync(store.removeTag(tag));

  return { 
    model,
    addEntityType,
    updateEntityType,
    removeEntityType,
    getEntityType,
    addTag,
    removeTag
  };

}