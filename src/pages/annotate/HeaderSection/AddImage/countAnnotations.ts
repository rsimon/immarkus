import type { CanvasInformation, FileImage, Folder, IIIFManifestResource, IIIFResource } from '@/model';
import { Store } from '@/store';
import { AddImageListItem, isFileImage, isFolder, isIIIManifestResource } from './Types';

export const countAnnotations = (
  items: AddImageListItem[],
  store: Store
): Promise<{ item: AddImageListItem, annotations: number }[]> => {
  return items.reduce((promise, item) => promise.then(agg => {
    if (isFolder(item)) {
      return store.getAnnotationsRecursive(item.id, { type: 'image' })
        .then(annotations => [...agg, { item, annotations: annotations.length }]);
    } else if (isIIIManifestResource(item)) {
      return store.getAnnotationsRecursive(`iiif:${item.id}`, { type: 'image' })
        .then(annotations => [...agg, { item, annotations: annotations.length }]);
    } else if (isFileImage(item)) {
      return store.countAnnotations(item.id).then(count => 
        [...agg, { item, annotations: count }]);
    } else {
      return store.countAnnotations(`iiif:${item.manifestId}:${item.id}`).then(count => 
        [...agg, { item, annotations: count }]);
    }
  }), Promise.resolve<{ item: AddImageListItem, annotations: number }[]>([]));
}