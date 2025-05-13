import { CanvasInformation, Folder, IIIFManifestResource, IIIFResource, Image, RootFolder } from '@/model';
import { W3CAnnotation } from '@annotorious/react';
import { CozyCanvas } from 'cozy-iiif';

export type OverviewLayout = 'grid' | 'table';

export interface AnnotationMap {

  images: Record<string, W3CAnnotation[]>;

  folders: Record<string, W3CAnnotation[]>;

}

export type FolderItem = (Folder | RootFolder) & {

  type: 'folder';

}

export type ImageItem = Image & {

  type: 'image'

}

export type CanvasItem = {

  type: 'canvas';

  canvas: CozyCanvas;

  info: CanvasInformation

}

export type OverviewItem = FolderItem | ImageItem | IIIFResource | CanvasItem;

export const isPresentationManifest = (f: Folder | RootFolder | IIIFManifestResource): f is IIIFManifestResource =>
  (f as IIIFManifestResource).uri !== undefined;

export const isRootFolder = (f: Folder | RootFolder | IIIFManifestResource): f is RootFolder =>
  !isPresentationManifest(f) && (f as Folder).id === undefined;