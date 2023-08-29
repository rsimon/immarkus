import { AnnotatedImage } from './AnnotatedImage';

export interface PersistentCollection {

  images: AnnotatedImage[];

  handle: FileSystemDirectoryHandle;

}