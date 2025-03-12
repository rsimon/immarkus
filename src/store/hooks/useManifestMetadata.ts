import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { useStore } from './useStore';
import type { Store } from '../Store';

export const getManifestMetadata = (store: Store, manifestId: string) => {
  const id = `iiif:${manifestId}`;

  return store.getAnnotations(id, { type: 'metadata'})
    // Note: metadata annotations on this manifest AND ALL CANVASES!
    .then(annotations => {
      const meta = annotations.filter(a => (a.target as any).source === id);

      if (meta.length > 1)
        console.warn(`Integrity error: multiple metadata annotations for manifest ${manifestId}`);

      if (meta.length === 1) {
        const annotation = meta[0];

        if (Array.isArray(annotation.body)) {
          if (annotation.body.length !== 1) {
            console.warn(`Integrity error: metadata annotation for manifest ${manifestId} has != 1 body`);
            return { annotation, metadata: {} };
          } else {
            const metadata = annotation.body[0];
            return { annotation, metadata };
          }
        } else if (!annotation.body) {
          console.warn(`Integrity error: metadata annotation for manifest ${manifestId} has no body`);
          return { annotation, metadata: {} };
        } else {
          const metadata = annotation.body;
          return { annotation, metadata };
        }
      } else if (meta.length > 1) {
        // Repair
        meta.reduce<Promise<void>>((p, a) => 
            p.then(() => store.deleteAnnotation(id, a)), Promise.resolve());
      }

      return { annotation: undefined, metadata: {} };
    });
}

export const useManifestMetadata = (manifestId: string) => {
  const store = useStore();

  const [data, setData] = 
    useState<{ annotation: W3CAnnotation, metadata: W3CAnnotationBody }>({ annotation: undefined, metadata: undefined });

  useEffect(() => {
    getManifestMetadata(store, manifestId).then(setData);
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