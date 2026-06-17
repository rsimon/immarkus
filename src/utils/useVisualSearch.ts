import { useCallback, useEffect, useMemo, useState } from 'react';
import { v5 as uuidv5 } from 'uuid';
import { indexExists, openIndex, VisualSearchIndex } from 'browser-visual-search';
import { IIIFManifestResource } from '@/model';
import { useStore } from '@/store';
import { fetchManifest } from '@/utils/iiif';
import { CozyCanvas } from 'cozy-iiif';
import { useRuntimeConfig } from '@/RuntimeConfig';

export type IndexStatus = 
  | { state: 'not_supported'}
  | { state: 'loading' }
  | { state: 'index_missing' } 
  | { state: 'index_incomplete', toAdd: number, toRemove: number }
  | { state: 'index_complete', failed?: FailedManifests };

export type IndexingProgress = 
  | { phase: 'initializing' }
  | { phase: 'downloading_model', model: string, progress: number}
  | { phase: 'fetching', url: string, progress: number, total: number, errors: number }
  | { phase: 'indexing', id: string, progress: number, total: number, errors: number }
  | { phase: 'done', total: number, failed: string[] };

export type FailedManifests = { manifests: string[], totalImages: number };

export interface VisualSearch {

  indexStatus: IndexStatus;

  index: VisualSearchIndex;

  deleteIndex(): Promise<void>;

  runIndexing(onProgress?: (progress: IndexingProgress) => void): Promise<void>;

}

const fetchImage = (canvas: CozyCanvas): Promise<File> => {
  const url = canvas.getImageURL(1024);
  return fetch(url)
    .then(res => res.blob())
    .then(async blob => {
      const filename = new URL(url).pathname.split('/').pop() ?? 'image.bin';
      return new File([blob], filename, { type: blob.type });
    });
}

export const useVisualSearch = (segmenterUrl?: string): VisualSearch => {

  const store = useStore();

  const { visual_search: config } = useRuntimeConfig();

  const currentEmbedderUrl: string | undefined = config?.embedder_url;

  const currentSegmenterUrl: string | undefined = segmenterUrl || (
    config?.segmenter_url 
      ? Array.isArray(config.segmenter_url) ? config.segmenter_url[0] : config.segmenter_url 
      : undefined
  );

  if (!currentEmbedderUrl || !currentSegmenterUrl) {
    return { 
      index: undefined as VisualSearchIndex, 
      indexStatus: { state: 'not_supported' }, 
      deleteIndex: () => { throw new Error('Models missing') },
      runIndexing: () => { throw new Error('Models missing') }
    };
  }

  const storedImageIds = useMemo(() => {
    if (!store) return [];

    const images = store.images.map(i => i.id);
    const canvasIds = store.iiifResources.flatMap(resource => {
      const canvases = (resource as IIIFManifestResource).canvases;
      return canvases.map(c => `iiif:${c.manifestId}:${c.id}`);
    }, []);

    return [...images, ...canvasIds];
  }, [store]);

  const [indexStatus, setIndexStatus] = useState<IndexStatus>({ state: 'loading' });

  const [index, setIndex] = useState<VisualSearchIndex>();

  useEffect(() => {
    if (!store) return;

    setIndexStatus({ state: 'loading' });

    openIndex(store.getRootFolder().handle, { 
      segmenterUrl: currentSegmenterUrl,
      embedderUrl: currentEmbedderUrl, 
      create: true 
    }).then(index => {
      const indexedImageIds = index.images.map(i => i.imageId);

      const toAdd = storedImageIds.filter(id => !indexedImageIds.includes(id));
      const toRemove = indexedImageIds.filter(id => !storedImageIds.includes(id));

      if (indexedImageIds.length === 0 && toAdd.length > 0) {
        setIndexStatus({ state: 'index_missing' });
      } else if (toAdd.length > 0) {
        setIndexStatus({ state: 'index_incomplete', toAdd: toAdd.length, toRemove: toRemove.length });
      } else {
        setIndexStatus({ state: 'index_complete' });
      }

      setIndex(index);
    })
    .catch(error => {
      // Should never happen (due to `create: true`)
      setIndexStatus({ state: 'index_missing' });
      console.error(error);
    });
  }, [storedImageIds, currentSegmenterUrl, currentEmbedderUrl]);

  const runIndexing = useCallback(async (onProgress?: (progress: IndexingProgress) => void, skipExisting = true): Promise<void> => {
    if (!index || !store) return;

    onProgress?.({ phase: 'initializing' });

    await index.downloadSegmentationModel(progress => {
      if (progress.status === 'downloading') {
        onProgress?.({ 
          phase: 'downloading_model', 
          model: currentSegmenterUrl, 
          progress: progress.total ? Math.round(100 * progress.loaded / progress.total) : 0
        });
      }
    });

    await index.downloadEmbeddingModel(progress => {
      if (progress.status === 'downloading') {
        onProgress?.({ 
          phase: 'downloading_model', 
          model: currentEmbedderUrl, 
          progress: progress.total ? Math.round(100 * progress.loaded / progress.total) : 0
        });
      }
    });

    const images = store.images;
    const manifests = store.iiifResources as IIIFManifestResource[];

    const total = images.length + manifests.flatMap(m => m.canvases).length;

    // Index image files
    if (images.length > 0)
      onProgress?.({ phase: 'indexing', progress: 0, total, id: images[0].id, errors: 0 });

    await images.reduce<Promise<void>>((promise, image, idx) => promise.then(() => {
      const skip = skipExisting && index.images.some(i => i.imageId === image.id);

      return skip ? Promise.resolve() : index.addToIndex(image.file, image.id).then(() => {
        onProgress?.({ phase: 'indexing', id: image.id, progress: idx + 1, total, errors: 0 })
      });
    }), Promise.resolve());
    
    let progress = images.length;

    let failedManifests: string[] = [];
    let failedCanvasCount = 0;

    // Resolve IIIF manifests
    await manifests.reduce<Promise<void>>((promise, manifest) => promise.then(async () => {
      onProgress?.({ 
        phase: 'fetching',
        url: manifest.uri,
        progress,
        total,
        errors: failedManifests.length
      });

      try {
        const resolved = await fetchManifest(manifest.uri);
        
        return resolved.canvases.reduce<Promise<void>>((p, canvas, idx) => p.then(() => {
          const id = `iiif:${manifest.id}:${manifest.canvases[idx].id}`;
          
          const skip = skipExisting && index.images.some(i => i.imageId === id);
          return skip ? Promise.resolve() : fetchImage(canvas).then(file => {        
            onProgress?.({ 
              phase: 'indexing',
              progress,
              total,
              id,
              errors: failedManifests.length
            });

            progress++;

            return index.addToIndex(file, id).then(() => {
              onProgress?.({ phase: 'indexing', id, progress, total, errors: failedManifests.length });
            });
          })
        }), Promise.resolve());
      } catch (error) {
        // console.error(error);
        console.error(`Error fetching manifest: ${manifest.uri} (${manifest.canvases.length} canvases)`);

        progress += manifest.canvases.length;

        failedManifests.push(manifest.uri);
        failedCanvasCount += manifest.canvases.length;

        const id = `iiif:${manifest.id}:${manifest.canvases[manifest.canvases.length - 1].id}`;
        onProgress?.({ phase: 'indexing', id, progress, total, errors: failedManifests.length });
      }
    }), Promise.resolve());
    
    await index.save();
    
    setIndexStatus({ 
      state: 'index_complete', 
      failed: { 
        manifests: failedManifests, 
        totalImages: failedCanvasCount
      } 
    });

    onProgress?.({ phase: 'done', total, failed: failedManifests });
  }, [index, storedImageIds, currentEmbedderUrl, currentSegmenterUrl]);

  const deleteIndex = useCallback(async () => {
    if (!store) return;

    try {
      const rootHandle = store.getRootFolder().handle;
      await rootHandle.removeEntry('.visual-search', { recursive: true });

      cachedResult = null;
      pendingPromise = null;

      setIndex(undefined);
      setIndexStatus({ state: 'index_missing' });
    } catch (error) {
      console.error('Failed to delete visual search index:', error);
    }
  }, [store]);

  return useMemo(() => ({ 
    index, 
    indexStatus,
    deleteIndex,
    runIndexing
  }), [index, indexStatus, deleteIndex, runIndexing]);

}

/**
 * A faster, cached shortcut that provides "index exists" info with minimal overhead
 */
let cachedResult: boolean | null = null;
let pendingPromise: Promise<boolean> | null = null;

const getVisualSearchAvailable = (handle: FileSystemDirectoryHandle) => {
  if (cachedResult !== null)
    return Promise.resolve(cachedResult);

  if (pendingPromise)
    return pendingPromise;

  pendingPromise = indexExists(handle).then(result => {
    cachedResult = result;
    return result;
  });

  return pendingPromise;
}

export const useVisualSearchAvailable = () => {

  const store = useStore();

  const [available, setAvailable] = useState(cachedResult);

  useEffect(() => {
    if (!store) return;
    getVisualSearchAvailable(store.getRootFolder().handle).then(setAvailable);
  }, [store]);

  return available;

}

// Random UUID v5 namespace for deterministic IDs
const NAMESPACE = 'a7cb2652-a967-405c-bcee-a08ba86ab6c1';

export const getDeterministicId = (imageId: string, bounds: [number, number, number, number]) =>
  uuidv5(`${imageId}-${bounds.join(',')}`, NAMESPACE);