import { Image } from './Image';

export interface Folder {

  name: string;

  path: string[];

  handle: FileSystemDirectoryHandle;

  parent?: FileSystemDirectoryHandle;

}

export type FolderItems = { images: Image[], folders: Folder[] };