import { useMemo, useState } from 'react';
import { Cog, ShieldAlert, ShieldX } from 'lucide-react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { IIIFManifestResource } from '@/model';
import { Button } from '@/ui/Button';
import { useStore } from '@/store';
import { Indexing } from './indexing';
import { useVisualSearch } from './useVisualSearch';

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
          <Indexing 
            vs={vs} 
            onDone={() => setIsIndexing(false)} />
        ) : vs.indexStatus === 'index_missing' ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-red-600 font-medium">
              <ShieldX className="size-5" /> Indexing required
            </div>

            <p className="text-sm max-w-md text-center leading-loose font-light">
              To use visual search, you must first index your collection. You
              have currently {count.toLocaleString()} images that require indexing.
            </p>

            <Button
              className="mt-6"
              onClick={() => setIsIndexing(true)}>
              <Cog className="size-5 mr-2" /> Start Indexing Now
            </Button>
          </div>
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
          <div>Index Complete</div>
        ) : null}
      </main>
    </div>
  )

}