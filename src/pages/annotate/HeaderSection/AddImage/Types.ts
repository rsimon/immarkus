import { CanvasInformation, FileImage, Folder, IIIFManifestResource } from '@/model';

// Types of items the search popover can display
export type AddImageItem = Folder | IIIFManifestResource | FileImage | CanvasInformation;

export const isIIIManifestResource = (item: AddImageItem): item is IIIFManifestResource =>
  'canvases' in item && item.type === 'PRESENTATION_MANIFEST';

export const isCanvasInformation = (item: AddImageItem): item is CanvasInformation =>
  'uri' in item && 'manifestId' in item;

export const isFolder = (item: AddImageItem): item is Folder =>
  'handle' in item;

export const isFileImage = (item: AddImageItem): item is FileImage =>
  'file' in item;
