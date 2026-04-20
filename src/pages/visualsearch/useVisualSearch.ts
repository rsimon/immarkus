import { useCallback, useEffect, useMemo, useState } from 'react';
import { openIndex, VisualSearchIndex } from 'browser-visual-search';
import { IIIFManifestResource } from '@/model';
import { useStore } from '@/store';
import { fetchManifest } from '@/utils/iiif';
import { CozyCanvas } from 'cozy-iiif';

export type IndexStatus = 'loading' | 'index_missing' | 'index_incomplete' | 'index_complete'; 

export type IndexingProgress = 
  | { phase: 'initializing' }
  | { phase: 'fetching', url: string, id: string, progress: number, total: number }
  | { phase: 'indexing', id: string, progress: number, total: number }
  | { phase: 'done', total: number };

export interface VisualSearch {

  indexStatus: IndexStatus;

  index: VisualSearchIndex;

  runIndexing(onProgress?: (progress: IndexingProgress) => void): Promise<void>;

}

const fetchImage = (canvas: CozyCanvas): Promise<File> => {
  const url = canvas.getImageURL(800);
  return fetch(url)
    .then(res => res.blob())
    .then(async blob => {
      const filename = new URL(url).pathname.split('/').pop() ?? 'image.bin';
      return new File([blob], filename, { type: blob.type });
    });
}

export const useVisualSearch = (): VisualSearch => {

  const store = useStore();

  const totalImageCount = useMemo(() => {
    if (!store) return 0;

    const imageCount = store.images.length;
    const canvasCount = store.iiifResources.reduce<number>((total, resource) => {
      return total + (resource as IIIFManifestResource).canvases.length;
    }, 0);

    return imageCount + canvasCount;
  }, [store]);

  const [indexStatus, setIndexStatus] = useState<IndexStatus>('loading');

  const [index, setIndex] = useState<VisualSearchIndex>();

  useEffect(() => {
    if (!store) return;

    openIndex(store.getRootFolder().handle, { 
      segmenterUrl: 'fastsam-s.onnx',
      embedderUrl: '/clip-vit-b32-visual.onnx', 
      create: true 
    }).then(index => {
        // TODO just a hack for testing - need to compare actual images later!
        const indexImageCount = index.images.length;
        if (indexImageCount === 0) {
          setIndexStatus('index_missing');
        } else if (indexImageCount < totalImageCount) {
          setIndexStatus('index_incomplete');
        } else {
          setIndexStatus('index_complete');
        }

        setIndex(index);
      })
      .catch(error => {
        // Should never happen (due to `create: true`)
        setIndexStatus('index_missing');
        console.error(error);
      });
  }, [totalImageCount]);

  const runIndexing = useCallback(async (onProgress?: (progress: IndexingProgress) => void): Promise<void> => {
    if (!index || !store) return;

    onProgress?.({ phase: 'initializing' });

    const images = store.images;
    const manifests = store.iiifResources as IIIFManifestResource[];

    const total = images.length + manifests.flatMap(m => m.canvases).length;

    // Index image files
    await images.reduce<Promise<void>>((promise, image, idx) => promise.then(() => {
      return index.addToIndex(image.file, image.id).then(() => {
        onProgress?.({ phase: 'indexing', id: image.id, progress: idx + 1, total })
      });
    }), Promise.resolve());
    
    let progress = images.length;

    // Resolve IIIF manifests
    await manifests.reduce<Promise<void>>((promise, manifest) => promise.then(async () => {
      const resolved = await fetchManifest(manifest.uri);
      return resolved.canvases.reduce<Promise<void>>((p, canvas, idx) => p.then(() => {
        return fetchImage(canvas).then(file => {
          progress++;

          const id = `iiif:${manifest.id}:${manifest.canvases[idx].id}`
          return index.addToIndex(file, id).then(() => {
            onProgress?.({ phase: 'indexing', id, progress, total });
          })
        })
      }), Promise.resolve());
    }), Promise.resolve());
    
    await index.save();
    
    onProgress?.({ phase: 'done', total });
  }, [index]);

  return useMemo(() => ({ index, runIndexing, indexStatus }), [index, runIndexing, indexStatus]);

}