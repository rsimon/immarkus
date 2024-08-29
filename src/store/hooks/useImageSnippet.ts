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

  const [imageId, setImageId] = useState<string | undefined>();

  useEffect(() => {
    if (typeof annotationOrId === 'string') {
      store.findAnnotation(annotationOrId).then(([annotation, image]) => {
        setAnnotation(annotation as W3CImageAnnotation);
        setImageId(image.id);
      });
    } else {
      store.findImageForAnnotation(annotationOrId.id).then(image => {
        setAnnotation(annotationOrId);
        setImageId(image.id);
      })
    }
  }, [annotationOrId]);

  const tuple = annotation && imageId 
    ? [[annotation, imageId]] as [ImageAnnotation | W3CImageAnnotation, string][] 
    : []; 

  const snippets = _useImageSnippets(tuple)

  return snippets && snippets.length > 0 ? snippets[0] : undefined;

}