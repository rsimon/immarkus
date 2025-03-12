import { useCallback, useEffect, useState } from 'react';
import { W3CImageAnnotation } from '@annotorious/react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { useStore } from '@/store';

export const useSortableAnnotations = () => {

  const { sources } = useAnnotoriousManifold();

  const store = useStore();

  const [annotations, setAnnotations] = useState<Map<string, W3CImageAnnotation[]>>(new Map());

  useEffect(() => {    
    const p = sources.reduce<Promise<[string, W3CImageAnnotation[]][]>>((p, sourceId) => 
      p.then(agg =>
        store.getAnnotations(sourceId, { type: 'image' }).then(annotations => ([
          ...agg, 
          [sourceId, annotations as W3CImageAnnotation[]]
        ]))
      )
    , Promise.resolve([]));

    p.then(arr => setAnnotations(new Map(arr)));
    
  }, [sources.join(':'), store]);

  const updateOrder = useCallback((sourceId: string, ids: string[]) => {
    const before = [...annotations.get(sourceId)];

    // Optimistic update
    const after = ids.map(id => before.find(a => a.id === id));
    setAnnotations(current => new Map(current).set(sourceId, after));

    store.bulkUpsertAnnotation(sourceId, after).catch(error => {
      console.error(error);
      setAnnotations(current => new Map(current).set(sourceId, before));
    });
  }, [annotations]);

  return { annotations, updateOrder };

}