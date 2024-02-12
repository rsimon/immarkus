import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { EntityType, LoadedImage } from '@/model';
import { Store, loadStore } from './Store';
import { DataModelStore } from './datamodel';
import { FolderMetadataSchema } from '@/model/FolderMetadataSchema';
import { ImageMetadataSchema } from '@/model/ImageMetadataSchema';

interface StoreContextState {

  store?: Store;

  setStore: React.Dispatch<React.SetStateAction<Store>>;

  model: DataModelStore;

  setModel: React.Dispatch<React.SetStateAction<DataModelStore>>;

}

const StoreContext = createContext<StoreContextState>(undefined);

interface StoreProviderProps {

  children: ReactNode;

}

export const StoreProvider = (props: StoreProviderProps) => {

  const [store, setStore] = useState<Store | undefined>(undefined);

  const [model, setModel] = useState<DataModelStore>(undefined);

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

export const useAnnotations = (
  imageId: string,
  opts: { type: 'image' | 'metadata' | 'both' } = { type: 'both' }
): W3CAnnotation[] => {
  const store = useStore();

  const [annotations, setAnnotations] = useState<W3CAnnotation[]>([]);

  useEffect(() => {
    store.getAnnotations(imageId, opts).then(setAnnotations);
  }, [imageId]);

  return annotations;
}

export const useImageMetadata = (imageId: string) => {
  const store = useStore();

  const [data, setData] = 
    useState<{ annotation: W3CAnnotation, metadata: W3CAnnotationBody }>({ annotation: undefined, metadata: undefined });

  useEffect(() => {
    store.getAnnotations(imageId, { type: 'metadata' }).then(annotations => {
      if (annotations.length > 1)
        console.warn(`Integrity error: multiple metadata annotations for image ${imageId}`);

      if (annotations.length === 1) {
        const annotation = annotations[0];

        if (Array.isArray(annotation.body)) {
          if (annotation.body.length !== 1) {
            console.warn(`Integrity error: metadata annotation for image ${imageId} has != 1 body`);
          } else {
            const metadata = annotation.body[0];
            setData({ annotation, metadata });
          }
        } else if (!annotation.body) {
          console.warn(`Integrity error: metadata annotation for image ${imageId} has no body`);
          setData({ annotation, metadata: {} });
        } else {
          const metadata = annotation.body;
          setData({ annotation, metadata });
        }
      } else {
        setData({ annotation: undefined, metadata: {} });
      }
    });
  }, [imageId]);

  const updateMetadata = (metadata: W3CAnnotationBody) => {
    const annotation: Partial<W3CAnnotation> = data.annotation || {
      '@context': 'http://www.w3.org/ns/anno.jsonld',
      type: 'Annotation',
      id: uuidv4(),
      target: {
        source: imageId
      }
    };

    const next = { 
      ...annotation,
      body: {
        ...metadata,
        purpose: 'describing'
      }
    } as W3CAnnotation;

    store.upsertAnnotation(imageId, next);

    setData({ annotation: next, metadata: next.body as W3CAnnotationBody })
  }

  return { metadata: data.metadata, updateMetadata };

}

export const useDataModel = () => {

  const { store, model, setModel } = useContext(StoreContext);

  const setAsync = (p: Promise<void>) =>
    p.then(() => setModel({...store.getDataModel()}));

  /** 
   * Override methods that modify the model and update the model
   * instance in the state, so that it becomes reactive.
   */
  const addEntityType = (type: EntityType) =>
    setAsync(model.addEntityType(type));

  const addFolderSchema = (schema: FolderMetadataSchema) =>
    setAsync(model.addFolderSchema(schema));

  const addImageSchema = (schema: ImageMetadataSchema) =>
    setAsync(model.addImageSchema(schema));

  const removeEntityType = (typeOrId: EntityType | string) =>
    setAsync(model.removeEntityType(typeOrId));

  const removeFolderSchema = (schemaOrName: FolderMetadataSchema | string) =>
    setAsync(model.removeFolderSchema(schemaOrName));

  const removeImageSchema = (schemaOrName: ImageMetadataSchema | string) =>
    setAsync(model.removeImageSchema(schemaOrName));

  const updateEntityType = (type: EntityType) => 
    setAsync(model.updateEntityType(type));

  const updateFolderSchema = (schema: FolderMetadataSchema) =>
    setAsync(model.updateFolderSchema(schema));

  const updateImageSchema = (schema: ImageMetadataSchema) =>
    setAsync(model.updateImageSchema(schema));

  return { 
    ...model,
    addEntityType,
    addFolderSchema,
    addImageSchema,
    removeEntityType,
    removeFolderSchema,
    removeImageSchema,
    updateEntityType,
    updateFolderSchema,
    updateImageSchema
  };

}