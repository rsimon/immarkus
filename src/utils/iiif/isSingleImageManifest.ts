import { IIIFResource } from '@/model';

export const isSingleImageManifest = (resource: IIIFResource) => {
  if (!('canvases' in resource)) return false;
  return resource.canvases.length === 1;
}