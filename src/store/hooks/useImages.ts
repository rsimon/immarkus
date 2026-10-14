import { useEffect, useMemo, useState } from 'react';
import murmur from 'murmurhash';
import { LoadedIIIFImage, LoadedImage } from '@/model';
import { CozyCanvas } from 'cozy-iiif';
import { fetchManifest } from '@/utils/iiif/fetchManifest';
import { Store } from '../Store';
import { useStore } from './useStore';

/**
 * A common helper that returns a loaded image for an image ID,
 * regardless of whether it's a file or IIIF image.
 */
export const loadImage = (id: string, store: Store): Promise<LoadedImage> => {

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

  return id.startsWith('iiif:') ? resolveIIIFImage(id) : store.loadImage(id);
}

export const loadImages = (ids: string[], store: Store) => {
  const promises = ids.map(id => loadImage(id, store));
  return Promise.all(promises);
}

export const useImages = (
  imageIdOrIds?: string | string[],
  delay?: number
): LoadedImage | LoadedImage[] => {
  const store = useStore();

  // Keep IDs stable if a new array with same values is passed in
  const imageIds = useMemo(
    () => imageIdOrIds
      ? Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds]
      : undefined,
    [JSON.stringify(imageIdOrIds)]
  );

  const [images, setImages] = useState<LoadedImage[]>([]);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    setImages([]);

    if (!store || !imageIds) return () => {
      cancelled = true;
    };

    const load = () => {
      Promise.all(imageIds.map(id => loadImage(id, store)))
        .then(loaded => {
          if (!cancelled) setImages(loaded);
        });
    }

    if (delay)
      timeout = setTimeout(load, delay);
    else
      load();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [delay, imageIds]);

  return Array.isArray(imageIdOrIds) ? images : images.length > 0 ? images[0] : undefined;
}
