import { LoadedIIIFImage, LoadedImage } from '@/model';
import { useStore } from '@/store';
import { useMemo } from 'react';

export const useManifestLabel = (image?: LoadedImage) => {

  const store = useStore();

  return useMemo(() => {
    if (!image?.id.startsWith('iiif:')) return;
    const { manifestId } = (image as LoadedIIIFImage);
    return store.getIIIFResource(manifestId).name;
  }, [image])

}