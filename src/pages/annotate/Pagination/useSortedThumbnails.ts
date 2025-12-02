import { useCallback, useEffect, useMemo, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { CanvasInformation, FileImage } from '@/model';
import { useStore } from '@/store';
import { getLastEdit as _getLastEdit } from '@/utils/annotation';
import { useImageSorting } from '@/utils/useImageSorting';

const getId = (item: FileImage | CanvasInformation) => 
  'manifestId' in item ? `iiif:${item.manifestId}:${item.id}` : item.id;

export const useSortedThumbnails = (items: (FileImage | CanvasInformation)[]) => {

  const store = useStore();

  const [annotations, setAnnotations] = useState<Map<string, W3CAnnotation[]>>(new Map());

  // Sort settings persisted in Images overview via localStorage
  const { sortField, sortOrder } = useImageSorting();

  useEffect(() => {
    const imageAnnotations = items
      .reduce<Promise<Record<string, W3CAnnotation[]>>>((promise, item) => 
        promise.then(agg => {
          const id = getId(item);
          return store.getAnnotations(id, { type: 'image' }).then(a => ({ ...agg, [id]: a }));
        }), Promise.resolve({}));

    imageAnnotations.then(record => setAnnotations(new Map(Object.entries(record))))
  }, [items]);

  const getAnnotationCount = useCallback((item: FileImage | CanvasInformation) => {
    const id = getId(item);
    return annotations.get(id)?.length || 0;
  }, [annotations]);

  const getLastEdit = useCallback((item: FileImage | CanvasInformation) => {
    const id = getId(item);
    const onThisItem = annotations.get(id) || [];
    return _getLastEdit(onThisItem);
  }, [annotations]);

  const sorted = useMemo(() => {
    const sorted = [...items];

    if (sortField === 'name') {
      sorted.sort((a, b) => sortOrder * a.name.localeCompare(b.name));
    } else if (sortField === 'annotations') {
      sorted.sort((a, b) => {
        const annotationsA = getAnnotationCount(a);
        const annotationsB = getAnnotationCount(b);
        return (annotationsA - annotationsB) * sortOrder;
      });
    } else if (sortField === 'lastEdit') {
      sorted.sort((a, b) => {
        const lastEditA = getLastEdit(a)?.getTime() || 0;
        const lastEditB = getLastEdit(b)?.getTime() || 0;
        return (lastEditA - lastEditB) * sortOrder;
      });
    }

    return sorted; 
  }, [items, getAnnotationCount, getLastEdit, sortField, sortOrder]);

  return sorted

}