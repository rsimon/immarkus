import type { CanvasInformation, FileImage, Folder, IIIFManifestResource, IIIFResource } from '@/model';
import { Store } from '@/store';
import { AddImageListItem } from './Types';

export const countAnnotations = (
  folders: Folder[],
  manifests: IIIFResource[],
  images: FileImage[],
  store: Store
): Promise<{ item: AddImageListItem, annotations: number }[]> => {
  const countFolderAnnotations = folders.reduce((promise, folder) => promise.then(agg => {
    return store.getAnnotationsRecursive(folder.id, { type: 'image' })
      .then(annotations => [...agg, { item: folder, annotations: annotations.length }]);
  }), Promise.resolve<{ item: AddImageListItem, annotations: number }[]>([]));

  const countManifestAnnotations = manifests.reduce((promise, manifest) => promise.then(agg => {
    return store.getAnnotationsRecursive(`iiif:${manifest.id}`, { type: 'image' })
      .then(annotations => [...agg, { item: manifest as IIIFManifestResource, annotations: annotations.length }]);
  }), Promise.resolve<{ item: AddImageListItem, annotations: number }[]>([]));

  const countImageAnnotations = images.reduce((promise, image) => promise.then(agg => {
    return store.countAnnotations(image.id).then(count => 
      [...agg, { item: image, annotations: count }]);
  }), Promise.resolve<{ item: AddImageListItem, annotations: number }[]>([]));

  return Promise.all([
    countFolderAnnotations,
    countManifestAnnotations,
    countImageAnnotations
  ]).then(([folders, manifests, images]) => [...folders, ...manifests, ...images]);
}

export const countCanvasAnnotations = (canvases: CanvasInformation[], store: Store) => {
  return canvases.reduce((promise, canvas) => promise.then(agg => {
    return store.countAnnotations(`iiif:${canvas.manifestId}:${canvas.id}`).then(count => 
      [...agg, { item: canvas, annotations: count }]);
  }), Promise.resolve<{ item: CanvasInformation, annotations: number }[]>([]));
}