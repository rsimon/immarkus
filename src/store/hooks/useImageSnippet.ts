import { useEffect, useState } from 'react';
import { ImageAnnotation, W3CImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { ImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';
import { useImages } from './useImages';
import { useStore } from './useStore';

const _useImageSnippets = (arg: ([ImageAnnotation | W3CImageAnnotation, string][])) => {

  const imageIds = Array.from(new Set(arg.map(t => t[1])));

  const images = useImages(imageIds) as LoadedImage[];

  const [snippets, setSnippets] = useState<ImageSnippet[] | undefined>();

  useEffect(() => {
    if (!images || images.length === 0) return;

    const promise = Promise.all(arg
      .filter(([annotation, _]) => 'selector' in annotation.target)
      .map(([annotation, imageId]) => {
        const image = images.find(i => i.id === imageId);
        return getImageSnippet(image, annotation);
      }));

    promise.then(setSnippets);
  }, [arg.map(t => t[0].id).join('-'), images]);

  return snippets;
}

export const useImageSnippets = (annotations: (ImageAnnotation | W3CImageAnnotation)[]) => {

  const store = useStore();

  const [arg, setArg] = useState<[ImageAnnotation | W3CImageAnnotation, string][]>([]);
  
  useEffect(() => {
    const promise = annotations.reduce<Promise<[ImageAnnotation | W3CImageAnnotation, string][]>>((promise, annotation) => promise.then(tuples => {
      return store.findImageForAnnotation(annotation.id).then(image => {
        return [...tuples, [annotation, image.id]]
      });
    }), Promise.resolve([]));

    promise.then(setArg);
  }, [annotations.map(a => a.id).join('-')]);

  return _useImageSnippets(arg);

}

/**
 * For convenience, this method can also handle loading of the annotation from the ID. 
 */
export const useImageSnippet = (annotationOrId: ImageAnnotation | W3CImageAnnotation | string) => {

  const store = useStore();

  const [annotation, setAnnotation] = useState<ImageAnnotation | W3CImageAnnotation | undefined>();

  const [sourceId, setSourceId] = useState<string | undefined>();

  useEffect(() => {
    const id = typeof annotationOrId === 'string' ? annotationOrId : annotationOrId.id;

    store.findAnnotation(id).then(([annotation, source]) => {
      setAnnotation(annotation as W3CImageAnnotation);
      if ('uri' in source) {
        setSourceId(`iiif:${source.manifestId}:${source.id}`);
      } else {
        setSourceId(source.id);
      }
    });
  }, [annotationOrId]);

  const tuple = annotation && sourceId 
    ? [[annotation, sourceId]] as [ImageAnnotation | W3CImageAnnotation, string][] 
    : []; 

  const snippets = _useImageSnippets(tuple)

  return snippets && snippets.length > 0 ? snippets[0] : undefined;

}