import { useMemo, useState } from 'react';
import { Cog, ShieldAlert } from 'lucide-react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { IIIFManifestResource } from '@/model';
import { Button } from '@/ui/Button';
import { useVisualSearch } from '@/utils/useVisualSearch';
import { useStore } from '@/store';
import { IndexReady } from './IndexReady';
import { NoIndex } from './NoIndex';
import { IndexingProgress } from './IndexingProgress';

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
        {true ? (
          <IndexingProgress 
            vs={vs} 
            onDone={() => setIsIndexing(false)} />
        ) : vs.indexStatus === 'index_missing' ? (
          <NoIndex imageCount={count} />
        ) : vs.indexStatus === 'index_incomplete' ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-red-600 font-medium">
              <ShieldAlert className="size-5" /> Index incomplete
            </div>

            <p className="text-sm max-w-md text-center leading-loose font-light">
              Your index is outdated. There are {count.toLocaleString()} images that need indexing.
            </p>

            <Button
              className="mt-6"
              onClick={() => setIsIndexing(true)}>
              <Cog className="size-5 mr-2" /> Indexing Missing Images
            </Button>
          </div>
        ) : vs.indexStatus === 'index_complete' ? (
          <IndexReady vs={vs} />
        ) : null}
      </main>
    </div>
  )

}