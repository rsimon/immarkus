import murmur from 'murmurhash';
import pThrottle from 'p-throttle';
import { ImageAnnotation, W3CImageAnnotation, W3CImageFormat } from '@annotorious/react';
import { Store } from '@/store';
import Worker from './getImageSnippetWorker?worker';
import { fetchManifest } from './iiif/fetchManifest';
import { cropRegion } from 'cozy-iiif/level-0';
import { 
  CanvasInformation, 
  IIIFManifestResource, 
  Image, 
  LoadedFileImage, 
  LoadedIIIFImage, 
  LoadedImage 
} from '@/model';

// See https://www.npmjs.com/package/p-throttle
const IMAGE_API_CALL_LIMIT = 5; // Max number of calls within the interval
const IMAGE_API_CALL_INTERVAL = 1000; // The interval (milliseconds)

interface BaseImageSnippet {

  annotation: ImageAnnotation;

  height: number;

  width: number;

}

export interface FileImageSnippet extends BaseImageSnippet {

  data: Uint8Array;

}

export interface IIIFImageSnippet extends BaseImageSnippet {

  src: string;

}

export type ImageSnippet = FileImageSnippet | IIIFImageSnippet;

interface ScheduledSnippet {

  snippet: FileImageSnippet;

  time: Date;

}

const SnippetScheduler = () => {

  // Drop all cached images older than MAX_AGE 
  const MAX_AGE_MS = 2000;

  const cache: Map<string, ScheduledSnippet> = new Map();

  const inProgress: Map<string, Promise<FileImageSnippet>> = new Map();

  const purgeCache = () => {
    [...cache.entries()].forEach(([id, snippet]) => {
      const age = new Date().getTime() - snippet.time.getTime();
      if (age > MAX_AGE_MS) {
        cache.delete(id);
      }
    });
  }

  const getSnippet = (
    imageId: string, 
    blob: Blob, 
    annotation: ImageAnnotation,
    format = 'image/jpeg'
  ): Promise<FileImageSnippet> => {
    const cacheKey = `${imageId}-${annotation.id}`;

    // Already cached?
    if (cache.has(cacheKey))
      return Promise.resolve(cache.get(cacheKey)!.snippet);

    // Already in progress?
    if (inProgress.has(cacheKey))
      return inProgress.get(cacheKey)!;

    // If not, start processing and store the promise
    const snippetPromise = new Promise<FileImageSnippet>((resolve, reject) => {
      const worker = new Worker();

      const messageHandler = (e: MessageEvent) => {
        worker.removeEventListener('message', messageHandler);
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          const snippet: FileImageSnippet = e.data.snippet;
          cache.set(cacheKey, { snippet, time: new Date() });
          resolve(snippet);
        }

        inProgress.delete(cacheKey);
      };

      worker.addEventListener('message', messageHandler);

      worker.postMessage({ blob, annotation, format });
    });

    inProgress.set(cacheKey, snippetPromise);

    purgeCache();

    return snippetPromise;
  }

  return {
    getSnippet
  }

}

const scheduler = SnippetScheduler();

// Bit of an ad-hoc test...
const isW3C = (annotation: ImageAnnotation | W3CImageAnnotation): annotation is W3CImageAnnotation =>
  (annotation as W3CImageAnnotation).body !== undefined;

const throttle = pThrottle({
  limit: IMAGE_API_CALL_LIMIT, 
  interval: IMAGE_API_CALL_INTERVAL
});

const throttledFetch = throttle(async (url) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
});

export const getImageSnippet = (
  image: LoadedImage, 
  annotation: ImageAnnotation | W3CImageAnnotation,
  downloadIIIF?: boolean,
  format?: 'png' | 'jpg'
): Promise<ImageSnippet> => {
  let a: ImageAnnotation;

  const type = format === 'png' ? 'image/png' : 'image/jpeg'

  if (isW3C(annotation)) {
    const adapter = W3CImageFormat(image.name);
    const { parsed } = adapter.parse(annotation);
    if (!parsed)
      return Promise.reject('Failed to parse annotation');
    
    a = parsed;
  } else {
    a = annotation;
  }

  if (image.id.startsWith('iiif:')) {
    const { bounds } = a.target.selector.geometry;
    const { canvas } = (image as LoadedIIIFImage);

    const region = { 
      x: bounds.minX,
      y: bounds.minY,
      w: bounds.maxX - bounds.minX,
      h: bounds.maxY - bounds.minY
    };

    // For now, we're assuming that each canvas has exactly one image
    const firstImage = canvas.images[0];

    // Should never happen
    if (!firstImage) throw 'Canvas has no image';

    if (firstImage.type === 'dynamic') {
      const src = firstImage.getRegionURL(region);

      return Promise.resolve({
        annotation: a,
        height: bounds.maxY - bounds.minY,
        width: bounds.maxX - bounds.minX,
        src
      } as IIIFImageSnippet).then(snippet => {  
        if (downloadIIIF) {
          return throttledFetch(snippet.src)
            .then(data => ({...snippet, data}) as FileImageSnippet);
        } else {
          return snippet;
        }
      });
    } else if (firstImage.type === 'static') {
      // IIIF static image - fetch blob and crop
      return fetch(firstImage.url)
        .then(res => res.blob())
        .then(blob => scheduler.getSnippet(canvas.id, blob, a, type));
    } else if (firstImage.type === 'level0') {
      return cropRegion(firstImage, region).then(blob => {
        return blob.arrayBuffer().then(buffer => ({
          annotation: a,
          height: bounds.maxY - bounds.minY,
          width: bounds.maxX - bounds.minX,
          data: new Uint8Array(buffer)
        }));
      });
    }
  } else {
    const blob = new Blob([(image as LoadedFileImage).data])
    return scheduler.getSnippet(image.id, blob, a, type);
  }
}

export const getAnnotationsWithSnippets = (
  image: Image | CanvasInformation, 
  store: Store,
  downloadIIIF?: boolean
): Promise<{ annotation: W3CImageAnnotation, snippet?: ImageSnippet }[]> => {
  if ('uri' in image) {
    const manifest = store.iiifResources.find(r => r.id === image.manifestId) as IIIFManifestResource;

    return fetchManifest(manifest.uri).then(parsed => {  
      const canvas = parsed.canvases.find(c => c.id === image.uri);

      const loaded: LoadedIIIFImage = {
        canvas,
        folder: manifest.folder,
        id: `iiif:${manifest.id}:${murmur.v3(canvas.id)}`,
        manifestId: manifest.id,
        name: canvas.getLabel(),
        path: manifest.path
      }

      return store.getCanvasAnnotations(`iiif:${manifest.id}:${image.id}`).then(annotations => {
        if (annotations.length > 0) {
          return Promise.all(annotations.map(a => {
            const annotation = a as W3CImageAnnotation;

            return getImageSnippet(loaded, annotation, downloadIIIF)
              .then(snippet => ({ annotation, snippet }))
              .catch(error => { 
                console.warn(error);
                return { annotation };
              });
          }));  
        } else {
          return Promise.resolve([]);
        }
      });
    })
  } else {
    return store.loadImage(image.id).then(loaded =>
      store.getAnnotations(image.id, { type: 'image' }).then(annotations => 
        Promise.all(annotations.map(a => {
          const annotation = a as W3CImageAnnotation;
          return getImageSnippet(loaded, annotation)
            .then(snippet => ({ annotation, snippet }))
            .catch(() => ({ annotation }))
        }))
      )
    )
  }
}