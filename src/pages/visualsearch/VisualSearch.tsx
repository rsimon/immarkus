import { useMemo, useState } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { IIIFManifestResource } from '@/model';
import { useVisualSearch } from '@/utils/useVisualSearch';
import { useStore } from '@/store';
import { IndexReady } from './IndexReady';
import { NoIndex } from './NoIndex';
import { IndexingInProgress } from './IndexingInProgress';
import { IndexOutdated } from './IndexOutdated';

export const VisualSearch = () => {

  const store = useStore();

  const vs = useVisualSearch();

  const [isIndexing, setIsIndexing] = useState(false);

  const count = useMemo(() => {
    if (!store) return 0;

    const imageCount = store.images.length;
    
    const canvasCount = store.iiifResources.reduce<number>((total, resource) => {
      return total + (resource as IIIFManifestResource).canvases.length;
    }, 0);

    return imageCount + canvasCount;
  }, [store]);

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page about px-12 py-6 flex items-center justify-center">
        {isIndexing ? (
          <IndexingInProgress 
            vs={vs} 
            onDone={() => setIsIndexing(false)} />
        ) : vs.indexStatus === 'index_missing' ? (
          <NoIndex 
            imageCount={count} 
            onStartIndexing={() => setIsIndexing(true)} />
        ) : vs.indexStatus === 'index_incomplete' ? (
          <IndexOutdated />
        ) : vs.indexStatus === 'index_complete' ? (
          <IndexReady vs={vs} />
        ) : null}
      </main>
    </div>
  )

}