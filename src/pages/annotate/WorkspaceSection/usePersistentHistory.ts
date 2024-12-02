import { useCallback, useRef } from 'react';
import type { ChangeSet } from '@annotorious/core';
import { ImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';

export const usePersistentHistory = (images: LoadedImage[]) => {

  const historyRefs = useRef<Map<string, ChangeSet<ImageAnnotation>[]>>(new Map());

  const onUnmountAnnotator = useCallback((imageId: string) => (history: ChangeSet<ImageAnnotation>[]) => {
    historyRefs.current.set(imageId, history);
  }, [images]);

  const getPersistedHistory = useCallback((imageId: string) => (
    historyRefs.current.get(imageId) || []
  ), []);

  return { onUnmountAnnotator, getPersistedHistory };

}