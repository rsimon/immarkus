import { useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { useStore } from './useStore';

// Basic utility hook to prevent boilerplate
export const useAnnotation = (annotationId: string) => {

  const store = useStore();

  const [annotation, setAnnotation] = useState<W3CAnnotation |  undefined>();

  useEffect(() => {
    store.findAnnotation(annotationId).then(([annotation, _]) => setAnnotation(annotation));
  }, [store, annotationId]);

  return annotation;

}