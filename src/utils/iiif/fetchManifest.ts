import pThrottle from 'p-throttle';
import { type CozyManifest, Cozy } from 'cozy-iiif';

const cache = new Map<string, CozyManifest>();

const throttle = pThrottle({
  limit: 5,
  interval: 1000
});

const throttledParse = throttle((uri: string) => Cozy.parseURL(uri));

export const fetchManifest = (uri: string): Promise<CozyManifest | undefined> => {
  if (cache.has(uri)) {
    return Promise.resolve(cache.get(uri));
  } else {
    return throttledParse(uri)
      .then(result => {
        if (result.type === 'error') {
          console.error(result);
        } else if (result.type !== 'manifest') {
          console.error('Unsupported content type', result);
        } else {
          cache.set(uri, result.resource);
          return result.resource;
        }
      });
  }
}

export const fetchManifests = (uris: string[]): Promise<CozyManifest[]> => 
  uris.reduce<Promise<CozyManifest[]>>((promise, uri) => promise.then(all => (
    fetchManifest(uri).then(manifest => ([...all, manifest]))
  )), Promise.resolve([]));