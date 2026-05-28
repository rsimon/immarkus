import { useMemo, useState } from 'react';
import { IIIFManifestResource } from '@/model';
import { useVisualSearch } from '@/utils/useVisualSearch';
import { useStore } from '@/store';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { IndexReady } from './IndexReady';
import { NoIndex } from './NoIndex';
import { IndexingInProgress } from './IndexingInProgress';
import { IndexOutdated } from './IndexOutdated';

export const VisualSearch = () => {

  const store = useStore();

  const [isIndexing, setIsIndexing] = useState(false);

  const { visual_search } = useRuntimeConfig();

  const availableSegmenters = visual_search.segmenter_url ?
    Array.isArray(visual_search.segmenter_url) ? visual_search.segmenter_url : [visual_search.segmenter_url] :
    [];

  const [selectedSegmenter, setSelectedSegmenter] = useState(availableSegmenters[0]);

  const vs = useVisualSearch(selectedSegmenter);

  const count = useMemo(() => {
    if (!store) return 0;

    const imageCount = store.images.length;

    const canvasCount = store.iiifResources.reduce<number>((total, resource) => {
      return total + (resource as IIIFManifestResource).canvases.length;
    }, 0);

    return imageCount + canvasCount;
  }, [store]);

  return (
    <div className="mt-4 max-w-2xl">
      {isIndexing ? (
        <IndexingInProgress 
          vs={vs} 
          onDone={() => setIsIndexing(false)} />
      ) : vs.indexStatus.state === 'index_missing' ? (
        <NoIndex 
          imageCount={count} 
          availableSegmenters={availableSegmenters}
          selectedSegmenter={selectedSegmenter}
          onStartIndexing={() => setIsIndexing(true)} 
          onChangeSegmenter={setSelectedSegmenter} />
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