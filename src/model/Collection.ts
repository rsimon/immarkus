import { AnnotatedImage } from './AnnotatedImage';

export interface ReadableCollection {

  images: AnnotatedImage[];

  isLoaded: boolean;

}

export interface WritableCollection extends ReadableCollection {

  setImages: React.Dispatch<React.SetStateAction<AnnotatedImage[]>>

  setIsLoaded(loaded: boolean): void;

}