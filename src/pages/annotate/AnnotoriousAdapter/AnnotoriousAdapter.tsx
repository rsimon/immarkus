import { useEffect } from 'react';
import { AnnotoriousImageAnnotator, useAnnotator } from '@annotorious/react';
import { Image } from '@/model';
import { useStore } from '@/store';

interface AnnotoriousAdapterProps {

  image: Image;

  onSaving(): void;

  onSaved(): void;

  onError(error: Error): void;

}

const MIN_SAVE_WAIT = 1000;

export const AnnotoriousAdapter = (props: AnnotoriousAdapterProps) => {

  const { image } = props;

  const store = useStore()!;

  const anno = useAnnotator<AnnotoriousImageAnnotator>();

  useEffect(() => {
    if (anno && store) {
      const { id } = image;

      const annotations = store.getAnnotations(id);

      // @ts-ignore
      anno.setAnnotations(annotations.filter(a => a.target.selector));

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

      anno.on('createAnnotation', annotation =>
        withSaveStatus(() => store.upsertAnnotation(id, annotation)));

      anno.on('deleteAnnotation', annotation =>
        withSaveStatus(() => store.deleteAnnotation(id, annotation)));

      anno.on('updateAnnotation', annotation =>
        withSaveStatus(() => store.upsertAnnotation(id, annotation)));
    }
  }, [anno]);

  return null;

}