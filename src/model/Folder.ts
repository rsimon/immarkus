import { IIIFResource } from './IIIFResource';
import { FileImage } from './Image';

export interface Folder {

  id: string;

  name: string;

  path: string[];

  handle: FileSystemDirectoryHandle;

  parent?: FileSystemDirectoryHandle;

}

export interface RootFolder extends Omit<Folder, 'id'> {};

export type FolderItems = { images: FileImage[], folders: Folder[], iiifResources: IIIFResource[] };