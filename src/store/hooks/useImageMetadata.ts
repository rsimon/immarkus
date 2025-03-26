import { useCallback, useEffect, useState } from 'react';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from './useStore';
import type { Store } from '../Store';

export const getImageMetadata = (store: Store, imageId: string) => {
  return store.getAnnotations(imageId, { type: 'metadata' }).then(annotations => {
    if (annotations.length > 1)
      console.warn(`Integrity error: multiple metadata annotations for image ${imageId}`);

    if (annotations.length === 1) {
      const annotation = annotations[0];

      if (Array.isArray(annotation.body)) {
        if (annotation.body.length !== 1) {
          console.warn(`Integrity error: metadata annotation for image ${imageId} has != 1 body`);
          return { annotation, metadata: {} };
        } else {
          const metadata = annotation.body[0];
          return { annotation, metadata };
        }
      } else if (!annotation.body) {
        console.warn(`Integrity error: metadata annotation for image ${imageId} has no body`);
        return { annotation, metadata: {} };
      } else {
        const metadata = annotation.body;
        return { annotation, metadata };
      }
    } else {
      return { annotation: undefined, metadata: {} };
    }
  });
}

export const useImageMetadata = (imageId: string) => {
  const store = useStore();

  const [data, setData] = 
    useState<{ annotation: W3CAnnotation, metadata: W3CAnnotationBody }>({ annotation: undefined, metadata: undefined });

  useEffect(() => {
    getImageMetadata(store, imageId).then(setData);
  }, [imageId]);

  const updateMetadata = useCallback((metadata: W3CAnnotationBody) => {
    const annotation: Partial<W3CAnnotation> = data.annotation || {
      '@context': 'http://www.w3.org/ns/anno.jsonld',
      type: 'Annotation',
      id: uuidv4(),
      target: {
        source: imageId
      }
    };

    const next = { 
      ...annotation,
      body: {
        ...metadata,
        purpose: 'describing'
      }
    } as W3CAnnotation;

    store.upsertAnnotation(imageId, next);

    setData({ annotation: next, metadata: next.body as W3CAnnotationBody });
  }, [data, imageId]);

  return { metadata: data.metadata, updateMetadata };
}