import { CanvasInformation, FileImage, Folder, IIIFManifestResource } from '@/model';

export type AddImageListItem = Folder | IIIFManifestResource | FileImage | CanvasInformation;

export const isIIIManifestResource = (item: AddImageListItem): item is IIIFManifestResource =>
  'canvases' in item && item.type === 'PRESENTATION_MANIFEST';

export const isCanvasInformation = (item: AddImageListItem): item is CanvasInformation =>
  'uri' in item && 'manifestId' in item;

export const isFolder = (item: AddImageListItem): item is Folder =>
  'handle' in item;

export const isFileImage = (item: AddImageListItem): item is FileImage =>
  'file' in item;
