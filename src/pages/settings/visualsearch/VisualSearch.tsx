import { useMemo, useState } from 'react';
import { IIIFManifestResource } from '@/model';
import { useVisualSearch } from '@/utils/useVisualSearch';
import { useStore } from '@/store';
import { IndexReady } from './IndexReady';
import { NoIndex } from './NoIndex';
import { IndexingInProgress } from './IndexingInProgress';
import { IndexOutdated } from './IndexOutdated';

export const VisualSearch = () => {

  const store = useStore();

  const [isIndexing, setIsIndexing] = useState(false);

  const [segmenterUrl, setSegmenterUrl] = useState<string | undefined>(undefined);

  const vs = useVisualSearch(segmenterUrl);

  const count = useMemo(() => {
    if (!store) return 0;

    const imageCount = store.images.length;

    const canvasCount = store.iiifResources.reduce<number>((total, resource) => {
      return total + (resource as IIIFManifestResource).canvases.length;
    }, 0);

    return imageCount + canvasCount;
  }, [store]);

  const onStartIndexing = (segmenterUrl: string) => {
    setSegmenterUrl(segmenterUrl);
    setIsIndexing(true);
  }

  return (
    <div className="mt-4 max-w-2xl">
      {(isIndexing && segmenterUrl) ? (
        <IndexingInProgress 
          vs={vs} 
          onDone={() => setIsIndexing(false)} />
      ) : vs.indexStatus.state === 'index_missing' ? (
        <NoIndex 
          imageCount={count} 
          onStartIndexing={onStartIndexing} />
      ) : vs.indexStatus.state === 'index_incomplete' ? (
        <IndexOutdated 
          toAdd={vs.indexStatus.toAdd} 
          onReindex={() => setIsIndexing(true)} />
      ) : vs.indexStatus.state === 'index_complete' ? (
        <IndexReady vs={vs} />
      ) : null}
    </div>
  )

}