import { useEffect, useState } from 'react';
import murmur from 'murmurhash';
import { LoadedIIIFImage, LoadedImage } from '@/model';
import { useStore } from './useStore';
import { parseIIIF } from '@/utils/iiif/lib';
import { Canvas } from '@iiif/presentation-3';
import { getCanvasLabel } from '@/utils/iiif/lib/helpers';

export const useImages = (
  imageIdOrIds?: string | string[],
  delay?: number
): LoadedImage | LoadedImage[] => {
  const store = useStore();

  const imageIds = imageIdOrIds ? Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds] : undefined;

  const [images, setImages] = useState<LoadedImage[]>([]);

  useEffect(() => {
    if (!store || !imageIds) return;

    const findCanvas = (canvases: Canvas[], canvasHash: string) =>
      canvases.find(c => {
        const hash = murmur.v3(c.id).toString();
        return hash === canvasHash;
      });

    const resolveIIIFImage = (id: string) => {
      const [resourceId, canvasHash] = id.substring('iiif:'.length).split(':');
      if (!resourceId) throw `Invalid IIIF image ID: ${id}`;

      const resource = store.getIIIFResource(resourceId);

      return fetch(resource.uri)
        .then(res => res.json())
        .then(data => {
          const { error, result } = parseIIIF(data);
          if (error || !result) {
            console.error(error);
          } else {
            const canvas = findCanvas(result.parsed, canvasHash);

            const image: LoadedIIIFImage = {
              canvas,
              folder: resource.folder,
              id,
              manifestId: resource.id,
              name: getCanvasLabel(canvas),
              path: resource.path
            }

            return image;
          }
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
