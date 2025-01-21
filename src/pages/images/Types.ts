import { CanvasInformation, Folder, IIIFManifestResource, IIIFResource, Image, RootFolder } from '@/model';
import { CozyCanvas } from '@/utils/cozy-iiif';

export type FolderGridItem = (Folder | RootFolder) & {

  type: 'folder';

}

export type ImageGridItem = Image & {

  type: 'image'

}

export type CanvasGridItem = {

  type: 'canvas';

  canvas: CozyCanvas;

  info: CanvasInformation

}

export type GridItem = FolderGridItem | ImageGridItem | IIIFResource | CanvasGridItem;

export const isPresentationManifest = (f: Folder | RootFolder | IIIFManifestResource): f is IIIFManifestResource =>
  (f as IIIFManifestResource).uri !== undefined;

export const isRootFolder = (f: Folder | RootFolder | IIIFManifestResource): f is RootFolder =>
  !isPresentationManifest(f) && (f as Folder).id === undefined;