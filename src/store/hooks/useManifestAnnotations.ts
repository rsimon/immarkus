import { useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { useStore } from './useStore';
import { GetManifestAnnotationOpts } from '../Store';

export const useManifestAnnotations = (
  sourceId: string,
  opts: GetManifestAnnotationOpts
): W3CAnnotation[] => {
  const store = useStore();

  const [annotations, setAnnotations] = useState<W3CAnnotation[]>([]);

  useEffect(() => {
    store.getManifestAnnotations(sourceId, opts).then(setAnnotations);
  }, [sourceId]);

  return annotations;
}
