import { useEffect, useMemo, useState } from 'react';
import { W3CImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { ImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';
import { useStore } from './useStore';

export const useImageSnippet = (annotation: W3CImageAnnotation) => {

  const store = useStore();

  const [loadedImage, setLoadedImage] = useState<LoadedImage | undefined>();

  const [snippet, setSnippet] = useState<ImageSnippet | undefined>();

  const image = useMemo(() => (
    store.images.find(i => i.name === (annotation.target as any).source)
  ), [annotation]);

  useEffect(() => {
    if (!image) return;

    store.loadImage(image.id).then(setLoadedImage);
  }, [annotation, image]);

  useEffect(() => {
    if (!loadedImage) return;

    if ('selector' in annotation.target) {
      getImageSnippet(loadedImage, annotation as W3CImageAnnotation)
        .then(setSnippet);
    }
  }, [annotation, loadedImage]);

  return snippet;

}