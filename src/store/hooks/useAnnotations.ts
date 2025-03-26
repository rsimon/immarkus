import { useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { useStore } from './useStore';
import { GetAnnotationOpts } from '../Store';

export const useAnnotations = (
  imageId: string,
  opts: GetAnnotationOpts
): W3CAnnotation[] => {
  const store = useStore();

  const [annotations, setAnnotations] = useState<W3CAnnotation[]>([]);

  useEffect(() => {
    store.getAnnotations(imageId, opts).then(setAnnotations);
  }, [imageId]);

  return annotations;
}
