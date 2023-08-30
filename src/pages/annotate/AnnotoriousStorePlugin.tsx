import { Image } from '@/model';
import { useStore } from '@/store';
import { AnnotoriousImageAnnotator, useAnnotator } from '@annotorious/react';
import { useEffect } from 'react';

interface AnnotoriousStorePluginProps {

  image: Image;

}

export const AnnotoriousStorePlugin = (props: AnnotoriousStorePluginProps) => {

  const { image } = props;

  const store = useStore()!;

  const anno = useAnnotator<AnnotoriousImageAnnotator>();

  useEffect(() => {
    if (anno && store) {
      const { id } = image;

      const annotations = store.getAnnotations(id);
      anno.setAnnotations(annotations);

      anno.on('createAnnotation', annotation =>
        store.addAnnotation(id, annotation));

      anno.on('deleteAnnotation', annotation => 
        store.deleteAnnotation(id, annotation));

      anno.on('updateAnnotation', annotation =>
        store.updateAnnotation(id, annotation));
    }
  }, [anno]);

  return null;

}