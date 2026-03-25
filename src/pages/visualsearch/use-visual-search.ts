import { useEffect, useMemo, useState } from 'react';
import { openIndex, VisualSearchIndex } from 'browser-visual-search';
import { IIIFManifestResource } from '@/model';
import { useStore } from '@/store';

export type IndexStatus = 'loading' | 'index_missing' | 'index_incomplete' | 'index_complete'; 

export const useVisualSearch = () => {

  const store = useStore();

  const totalImageCount = useMemo(() => {
    if (!store) return 0;

    const imageCount = store.images.length;
    const canvasCount = store.iiifResources.reduce<number>((total, resource) => {
      return total + (resource as IIIFManifestResource).canvases.length;
    }, 0);

    return imageCount + canvasCount;
  }, [store]);

  const [status, setStatus] = useState<IndexStatus>('loading');

  const [index, setIndex] = useState<VisualSearchIndex>();

  useEffect(() => {
    if (!store) return;

    openIndex(store.getRootFolder().handle, { embedderUrl: '' })
      .then(index => {
        // TODO just a hack for testing - need to compare actual images later!
        const indexImageCount = index.images.length;
        if (indexImageCount < totalImageCount) {
          setStatus('index_incomplete');
        } else {
          setStatus('index_complete');
        }

        setIndex(index);
      })
      .catch(error => {
        setStatus('index_missing');
        console.error(error);
      });
  }, [store, totalImageCount]);

  return { status, index };

}