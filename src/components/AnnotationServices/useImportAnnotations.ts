import { type ImageAnnotation, Origin, serializeW3CImageAnnotation } from '@annotorious/react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import type { LoadedImage } from '@/model';
import { useStore } from '@/store';
import type { AnnotationBatch } from '@/services';
import { useCallback } from 'react';

export const useImportAnnotations = () => {
  const store = useStore();
  const manifold = useAnnotoriousManifold();

  return useCallback((batches: AnnotationBatch[], image: LoadedImage) => {
    if (!store) return; // Should never happen

    const annotations = batches.reduce<ImageAnnotation[]>((all, batch) => 
      ([...all, ...batch.annotations.map(a => ({
        ...a,
        bodies: a.bodies.map(b => ({
          ...b,
          creator: {
            type: batch.generator.type || 'Software',
            ...batch.generator
          },
          created: new Date()
        })),
      }))]), []);

    // Add image annotations (internal data model!) to the annotator as a 'Remote' action
    const anno = manifold.getAnnotator(image.id);
    anno.state.store.bulkAddAnnotations(annotations, false, Origin.REMOTE);

    // Crosswalk to W3C and write to store. (Note: we could add them to the annotator
    // with Origin.LOCAL. This would handle W3C crosswalk for us. But because the
    // outer W3C API has no bulk handling, we'd generate one file write access per 
    // annotation, which will lead to overwrites!
    const w3c = annotations.map(a => serializeW3CImageAnnotation(a, image.id));
    store.bulkUpsertAnnotation(image.id, w3c);
  }, [store, manifold]);
}