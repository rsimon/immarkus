import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, loadStore } from './Store';
import { EntityType, LoadedImage, Tag } from '@/model';
import { W3CAnnotation } from '@annotorious/react';
import { DataModel } from '../model/DataModel';

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

export const useStore = (args: { redirect?: boolean } = {}) => {
  const { store } = useContext(StoreContext);

  const navigate = args.redirect && useNavigate();

  useEffect(() => {
    if (!store && navigate)
      navigate('/');
  }, []);

  return store;
}

export const useImages = (
  imageIdOrIds: string | string[],
  args: { redirect?: boolean, delay?: number } = {}
): LoadedImage | LoadedImage[] => {
  const store = useStore(args);

  const imageIds = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];

  const [images, setImages] = useState<LoadedImage[]>([]);

  useEffect(() => {
    const load = () => {
      const promises = imageIds.map(id => store.loadImage(id));
      Promise.all(promises).then(setImages);
    }

    if (store) {
      if (args.delay)
        setTimeout(() => load(), args.delay);
      else
        load();
    }
  }, [imageIds.join(','), store]);

  return Array.isArray(imageIdOrIds) ? images : images.length > 0 ? images[0] : undefined;
}

export const useAnnotations = (
  imageId: string,
  args: { redirect: boolean } = { redirect: false }
): W3CAnnotation[] => {
  const store = useStore(args);

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

  const getEntityType = (id: string) => 
    model.entityTypes.find(e => e.id === id);

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