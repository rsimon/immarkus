import { Folder, IIIFManifestResource, IIIFResource, Image, RootFolder } from '@/model';

export type FolderGridItem = (Folder | RootFolder) & {

  type: 'folder';

}

export type ImageGridItem = Image & {

  type: 'image'

}

export type GridItem = FolderGridItem | ImageGridItem | IIIFResource;

export const isPresentationManifest = (f: Folder | RootFolder | IIIFManifestResource): f is IIIFManifestResource =>
  (f as IIIFManifestResource).uri !== undefined;

export const isRootFolder = (f: Folder | RootFolder | IIIFManifestResource): f is RootFolder =>
  !isPresentationManifest(f) && (f as Folder).id === undefined;