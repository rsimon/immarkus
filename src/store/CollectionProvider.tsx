import { ReactNode, createContext, useContext, useState } from 'react';
import { AnnotatedImage, ReadableCollection, WritableCollection } from '@/model';

//@ts-ignore
const CollectionContext = createContext<WritableCollection>(null);

interface CollectionContextProps {

  children: ReactNode;

}

export const CollectionProvider = (props: CollectionContextProps) => {

  const [images, setImages] = useState<AnnotatedImage[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);

  const collection = { images, setImages, isLoaded, setIsLoaded };

  return (
    <CollectionContext.Provider value={collection}>
      {props.children}
    </CollectionContext.Provider>
  )

}

export const useWriteableCollection = () => useContext(CollectionContext);

export const useCollection = () => {
  const { images, isLoaded } = useContext(CollectionContext);
  return { images, isLoaded } as ReadableCollection;
}

/** Listen to changes and modifiy one specific image **/
export const useImage = (id: string) => {
  // TODO prevent unnecessary re-renders, by tracking state internally
  const { images, setImages } = useContext(CollectionContext);

  const image = images.find(img => img.id === id);

  const updateImage = (image: AnnotatedImage) => setImages(images => 
    images.map(img => img.id === id ? image : img));

  return { image, updateImage };
}