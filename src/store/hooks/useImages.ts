import { useEffect, useState } from 'react';
import { LoadedImage } from '@/model';
import { useStore } from './useStore';

export const useImages = (
  imageIdOrIds: string | string[],
  delay?: number
): LoadedImage | LoadedImage[] => {
  const store = useStore();

  const imageIds = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];

  const [images, setImages] = useState<LoadedImage[]>([]);

  useEffect(() => {
    const load = () => {
      const promises = imageIds.map(id => store.loadImage(id));
      Promise.all(promises).then(setImages);
    }

    if (store) {
      if (delay)
        setTimeout(() => load(), delay);
      else
        load();
    }
  }, [imageIds.join(','), store]);

  return Array.isArray(imageIdOrIds) ? images : images.length > 0 ? images[0] : undefined;
}
