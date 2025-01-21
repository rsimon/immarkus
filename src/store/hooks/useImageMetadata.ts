import { useCallback, useEffect, useState } from 'react';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from './useStore';

export const useImageMetadata = (imageId: string) => {
  const store = useStore();

  const [data, setData] = 
    useState<{ annotation: W3CAnnotation, metadata: W3CAnnotationBody }>({ annotation: undefined, metadata: undefined });

  useEffect(() => {
    store.getAnnotations(imageId, { type: 'metadata' }).then(annotations => {
      if (annotations.length > 1)
        console.warn(`Integrity error: multiple metadata annotations for image ${imageId}`);

      if (annotations.length === 1) {
        const annotation = annotations[0];

        if (Array.isArray(annotation.body)) {
          if (annotation.body.length !== 1) {
            console.warn(`Integrity error: metadata annotation for image ${imageId} has != 1 body`);
          } else {
            const metadata = annotation.body[0];
            setData({ annotation, metadata });
          }
        } else if (!annotation.body) {
          console.warn(`Integrity error: metadata annotation for image ${imageId} has no body`);
          setData({ annotation, metadata: {} });
        } else {
          const metadata = annotation.body;
          setData({ annotation, metadata });
        }
      } else {
        setData({ annotation: undefined, metadata: {} });
      }
    });
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