import { useEffect } from 'react';
import { AnnotoriousImageAnnotator, ImageAnnotation, W3CAnnotation, useAnnotator } from '@annotorious/react';
import { useStore } from '@/store';

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
        // @ts-ignore
        anno.setAnnotations(annotations.filter(a => a.target.selector));

        anno.on('createAnnotation', annotation =>
          withSaveStatus(() => store.upsertAnnotation(imageId, annotation)));

        anno.on('deleteAnnotation', annotation =>
          withSaveStatus(() => store.deleteAnnotation(imageId, annotation)));

        anno.on('updateAnnotation', annotation =>
          withSaveStatus(() => store.upsertAnnotation(imageId, annotation)));
      });
    }
  }, [anno]);

  return null;

}