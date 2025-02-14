import { useEffect, useState } from 'react';
import murmur from 'murmurhash';
import { LoadedIIIFImage, LoadedImage } from '@/model';
import { CozyCanvas } from 'cozy-iiif';
import { fetchManifest } from '@/utils/iiif/fetchManifest';
import { useStore } from './useStore';

export const useImages = (
  imageIdOrIds?: string | string[],
  delay?: number
): LoadedImage | LoadedImage[] => {
  const store = useStore();

  const imageIds = imageIdOrIds ? Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds] : undefined;

  const [images, setImages] = useState<LoadedImage[]>([]);

  useEffect(() => {
    if (!store || !imageIds) return;

    const findCanvas = (canvases: CozyCanvas[], canvasHash: string) =>
      canvases.find(c => {
        const hash = murmur.v3(c.id).toString();
        return hash === canvasHash;
      });

    const resolveIIIFImage = (id: string) => {
      const [resourceId, canvasHash] = id.substring('iiif:'.length).split(':');
      if (!resourceId) throw `Invalid IIIF image ID: ${id}`;

      const resource = store.getIIIFResource(resourceId);

      return fetchManifest(resource.uri)
        .then(manifest => {
          const canvas = findCanvas(manifest.canvases, canvasHash);

          const image: LoadedIIIFImage = {
            canvas,
            folder: resource.folder,
            id,
            manifestId: resource.id,
            name: canvas.getLabel(),
            path: resource.path
          }

          return image;
        });
    }

    const load = () => {
      const promises = imageIds.map(id =>
        // Resolve IIIF image or load file from store
        id.startsWith('iiif:') ? resolveIIIFImage(id) : store.loadImage(id));

      Promise.all(promises).then(setImages);
    }

    if (delay)
      setTimeout(() => load(), delay);
    else
      load();
  }, [(imageIds || []).join(','), store]);

  return Array.isArray(imageIdOrIds) ? images : images.length > 0 ? images[0] : undefined;
}
