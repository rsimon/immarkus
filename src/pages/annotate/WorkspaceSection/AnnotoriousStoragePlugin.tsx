import { useEffect } from 'react';
import { AnnotoriousImageAnnotator, ImageAnnotation, W3CAnnotation, useAnnotator } from '@annotorious/react';
import { useStore } from '@/store';
import { isW3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { parseIIIF } from '@/utils/iiif/lib';
import { parseIIIFId } from '@/utils/iiif/utils';

interface AnnotoriousStoragePluginProps {

  imageId: string;

  onSaving(): void;

  onSaved(): void;

  onError(error: Error): void;

}

const MIN_SAVE_WAIT = 1000;

export const AnnotoriousStoragePlugin = (props: AnnotoriousStoragePluginProps) => {

  const { imageId } = props;

  const store = useStore()!;

  const anno = useAnnotator<AnnotoriousImageAnnotator<ImageAnnotation, W3CAnnotation>>();

  useEffect(() => {
    // Wrap the op so that onSaving, onSaved and onError are
    // called appropriately 
    const withSaveStatus = (fn: () => Promise<void>) => {
      props.onSaving();
      
      const minWait = new Promise(resolve => 
        setTimeout(() => resolve(undefined), MIN_SAVE_WAIT));

      const both = Promise.all([minWait, fn()]);
      both
        .then(() => props.onSaved())
        .catch(error => props.onError(error));
    }

    // Relations require a bit more work, because a) they are split into two
    // annotations in the W3C serialization and b) the 'taggging' annotations
    // don't (currently) maintain their ID.
    const onUpdateRelation = (
      relation: [W3CAnnotation, W3CAnnotation], 
      _: W3CAnnotation | [W3CAnnotation | W3CAnnotation]
    ): Promise<void> => store.getAnnotations(imageId)
      .then(all => {
        const previous = all
          .filter(a => isW3CRelationMetaAnnotation(a))
          .filter(a => a.target === relation[0].id);

        if (previous.length > 0) {
          // Delete previous, then insert relation annotations
          return store.bulkDeleteAnnotations(imageId, previous).then(() => {
            return store.bulkUpsertAnnotation(imageId, relation);
          });
        } else {
          // No previous tags to delete - just insert
          
          return store.bulkUpsertAnnotation(imageId, relation);
        }
      });

    if (anno && store) {
      store.getAnnotations(imageId).then(annotations => {
        // IIIF? If so, these are all annotations on the resource - filter by canvas
        if (imageId.startsWith('iiif:')) {
          const onThisCanvas = annotations.filter(a => !Array.isArray(a.target) && a.target.source === imageId);
          anno.setAnnotations(onThisCanvas);
        } else {
          anno.setAnnotations(annotations);
        }

        anno.on('createAnnotation', annotation =>
          withSaveStatus(() => store.upsertAnnotation(imageId, annotation)));
  
        anno.on('deleteAnnotation', annotation => {
          if (Array.isArray(annotation))
            return withSaveStatus(() => store.bulkDeleteAnnotations(imageId, annotation));
          else
            return withSaveStatus(() => store.deleteAnnotation(imageId, annotation));
        });
  
        anno.on('updateAnnotation', (annotation, previous) => {
          if (Array.isArray(annotation)) {
            return withSaveStatus(() => 
              onUpdateRelation(annotation as unknown as [W3CAnnotation, W3CAnnotation], previous));
          } else {
            return withSaveStatus(() => store.upsertAnnotation(imageId, annotation))
          }
        });
      });
    }
  }, [anno]);

  return null;

}