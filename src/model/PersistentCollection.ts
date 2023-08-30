import { AnnotatedImage } from './Image';

export interface PersistentCollection {

  name: string;

  images: AnnotatedImage[];

  handle: FileSystemDirectoryHandle;

}