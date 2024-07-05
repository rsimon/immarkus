import { useEffect, useMemo, useState } from 'react';
import { W3CImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { ImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';
import { useImages } from './useImages';
import { useStore } from './useStore';

export const useImageSnippets = (annotations: W3CImageAnnotation[]) => {

  const store = useStore();

  const imageIds = useMemo(() => Array.from(annotations.reduce<Set<string>>((ids, annotation) => {
    const image = store.images.find(i => i.name === (annotation.target as any).source);
    return new Set([...ids, image.id]);
  }, new Set([]))), [annotations]);

  const images = useImages(imageIds) as LoadedImage[];

  const [snippets, setSnippets] = useState<ImageSnippet[] | undefined>();

  useEffect(() => {
    if (!images || images.length === 0) return;

    const promise = Promise.all(annotations
      .filter(a => 'selector' in a.target)
      .map(a => {
        const image = images.find(i => i.name === (a.target as any).source);
        return getImageSnippet(image, a);
      }));

    promise.then(setSnippets);
  }, [annotations, images]);

  return snippets;

}

export const useImageSnippet = (annotation: W3CImageAnnotation) => {

  const snippets = useImageSnippets([annotation]);

  return snippets && snippets.length > 0 ? snippets[0] : undefined;

}