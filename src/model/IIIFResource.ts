import { Folder } from "./Folder";

export interface IIIFResource {

  id: string;

  name: string;

  path: string[];

  folder: FileSystemDirectoryHandle;

  uri: string;

  importedAt: string;

  type: 'image' | 'manifest';

  majorVersion: number;

  pages: number;

}

export const isIIIFResource = (arg: Folder | IIIFResource): arg is IIIFResource =>
  (arg as IIIFResource).uri !== undefined;

export const isFolder = (arg: Folder | IIIFResource): arg is Folder => 
  !('uri' in arg);