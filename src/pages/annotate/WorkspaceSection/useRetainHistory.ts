import { useCallback, useEffect, useRef } from 'react';
import type { ChangeSet } from '@annotorious/core';
import { ImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';

export const useRetainHistory = (images: LoadedImage[]) => {

  const historyRefs = useRef<Map<string, ChangeSet<ImageAnnotation>[]>>(new Map());

  useEffect(() => {

  }, [images]);

  const getInitialHistory = useCallback((imageId: string) => (
    historyRefs.current.get(imageId) || []
  ), []);

  return { getInitialHistory };

}