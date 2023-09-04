import { Image } from '@/model';
import { useStore } from '@/store';
import { AnnotoriousImageAnnotator, useAnnotator } from '@annotorious/react';
import { useEffect } from 'react';

interface AnnotoriousStorePluginProps {

  image: Image;

  onSaving(): void;

  onSaved(): void;

  onError(error: Error): void;

}

export const AnnotoriousStorageAdapter = (props: AnnotoriousStorePluginProps) => {

  const { image } = props;

  const store = useStore()!;

  const anno = useAnnotator<AnnotoriousImageAnnotator>();

  useEffect(() => {
    if (anno && store) {
      const { id } = image;

      const annotations = store.getAnnotations(id);
      anno.setAnnotations(annotations);

      // Wrap the op so that onSaving, onSaved and onError are
      // called appropriately 
      const withSaveStatus = (op: () => Promise<void>) => {
        props.onSaving();
        op()
          .then(() => props.onSaved())
          .catch(error => props.onError(error));
      }

      anno.on('createAnnotation', annotation =>
        withSaveStatus(() => store.addAnnotation(id, annotation)));

      anno.on('deleteAnnotation', annotation =>
        withSaveStatus(() => store.deleteAnnotation(id, annotation)));

      anno.on('updateAnnotation', annotation =>
        withSaveStatus(() => store.updateAnnotation(id, annotation)));
    }
  }, [anno]);

  return null;

}