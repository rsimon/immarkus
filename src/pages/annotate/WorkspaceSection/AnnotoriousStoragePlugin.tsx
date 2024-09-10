import { useEffect } from 'react';
import { AnnotoriousImageAnnotator, ImageAnnotation, W3CAnnotation, useAnnotator } from '@annotorious/react';
import { isW3CRelationMetaAnnotation, useStore } from '@/store';

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

    if (anno && store) {
      store.getAnnotations(imageId).then(annotations => {
        anno.setAnnotations(annotations);
        
        anno.on('createAnnotation', annotation => {
          withSaveStatus(() => store.upsertAnnotation(imageId, annotation));
        });
  
        anno.on('deleteAnnotation', annotation => {
          return withSaveStatus(() => store.deleteAnnotation(imageId, annotation))
        });
  
        anno.on('updateAnnotation', (annotation, previous) => {
          if (Array.isArray(annotation)) {
            return withSaveStatus(() => {
              // First, delete any previous tags
              return store.getAnnotations(imageId)
                .then(all => {
                  const previous = all
                    .filter(isW3CRelationMetaAnnotation)
                    .filter(a => a.target === annotation[0].id);

                  if (previous.length > 0) {
                    return store.deleteAnnotation(imageId, previous[0]).then(() => {
                      return store.bulkUpsertAnnotation(imageId, annotation);
                    })
                  } else {
                    // No previous tags to delete
                    return store.bulkUpsertAnnotation(imageId, annotation);
                  }
                });
            });
          } else {
            return withSaveStatus(() => store.upsertAnnotation(imageId, annotation))
          }
        });
      });
    }
  }, [anno]);

  return null;

}