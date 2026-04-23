import { useMemo, useState } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { IIIFManifestResource } from '@/model';
import { useVisualSearch } from '@/utils/useVisualSearch';
import { useStore } from '@/store';
import { IndexReady } from './IndexReady';
import { NoIndex } from './NoIndex';
import { IndexingInProgress } from './IndexingInProgress';
import { IndexOutdated } from './IndexOutdated';
import { Separator } from '@/ui/Separator';

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

      <main className="page export px-12 py-6 max-w-2xl">
        <h1 className="text-xl font-semibold tracking-tight mb-2">Visual Search</h1>

        <p className="mt-1 text-sm leading-6 mb-6">
          Find objects inside your images based on example.
        </p>
        
        <div className="mt-4">
          {isIndexing ? (
            <IndexingInProgress 
              vs={vs} 
              onDone={() => setIsIndexing(false)} />
          ) : vs.indexStatus.state === 'index_missing' ? (
            <NoIndex 
              imageCount={count} 
              onStartIndexing={() => setIsIndexing(true)} />
          ) : vs.indexStatus.state === 'index_incomplete' ? (
            <IndexOutdated 
              toAdd={vs.indexStatus.toAdd} 
              onReindex={() => setIsIndexing(true)} />
          ) : vs.indexStatus.state === 'index_complete' ? (
            <IndexReady vs={vs} />
          ) : null}
        </div>
      </main>
    </div>
  )

}