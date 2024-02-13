import { useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { useStore } from './useStore';

export const useAnnotations = (
  imageId: string,
  opts: { type: 'image' | 'metadata' | 'both' } = { type: 'both' }
): W3CAnnotation[] => {
  const store = useStore();

  const [annotations, setAnnotations] = useState<W3CAnnotation[]>([]);

  useEffect(() => {
    store.getAnnotations(imageId, opts).then(setAnnotations);
  }, [imageId]);

  return annotations;
}
