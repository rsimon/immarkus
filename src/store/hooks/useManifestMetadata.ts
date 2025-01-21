import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { useStore } from './useStore';

export const useManifestMetadata = (manifestId: string) => {
  const store = useStore();

  const [data, setData] = 
    useState<{ annotation: W3CAnnotation, metadata: W3CAnnotationBody }>({ annotation: undefined, metadata: undefined });

  useEffect(() => {
    store.getAnnotations(`iiif:${manifestId}`, { type: 'metadata'})
      .then(annotations => {
        if (annotations.length > 1)
          console.warn(`Integrity error: multiple metadata annotations for manifest ${manifestId}`);
  
        if (annotations.length === 1) {
          const annotation = annotations[0];

          if (Array.isArray(annotation.body)) {
            if (annotation.body.length !== 1) {
              console.warn(`Integrity error: metadata annotation for manifest ${manifestId} has != 1 body`);
            } else {
              const metadata = annotation.body[0];
              setData({ annotation, metadata });
            }
          } else if (!annotation.body) {
            console.warn(`Integrity error: metadata annotation for manifest ${manifestId} has no body`);
            setData({ annotation, metadata: {} });
          } else {
            const metadata = annotation.body;
            setData({ annotation, metadata });
          }
        } else {
          setData({ annotation: undefined, metadata: {} });
        }
      });
  }, [manifestId]);

  const updateMetadata = useCallback((metadata: W3CAnnotationBody) => {
    const annotation: Partial<W3CAnnotation> = data.annotation || {
      '@context': 'http://www.w3.org/ns/anno.jsonld',
      type: 'Annotation',
      id: uuidv4(),
      target: {
        source: `iiif:${manifestId}`
      }
    };

    const next = { 
      ...annotation,
      body: {
        ...metadata,
        purpose: 'describing'
      }
    } as W3CAnnotation;

    store.upsertAnnotation(`iiif:${manifestId}`, next);

    setData({ annotation: next, metadata: next.body as W3CAnnotationBody });
  }, [manifestId, data]);

  return { metadata: data.metadata, updateMetadata };

}