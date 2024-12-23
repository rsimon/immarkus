import { IIIFResource } from './IIIFResource';
import { Image } from './Image';

export interface Folder {

  id: string;

  name: string;

  path: string[];

  handle: FileSystemDirectoryHandle;

  parent?: FileSystemDirectoryHandle;

}

export interface RootFolder extends Omit<Folder, 'id'> {};

export type FolderItems = { images: Image[], folders: Folder[], iiifResources: IIIFResource[] };