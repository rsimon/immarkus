import { type CozyManifest, Cozy } from 'cozy-iiif';

const cache = new Map<string, CozyManifest>();

export const fetchManifest = (uri: string): Promise<CozyManifest | undefined> => {
  if (cache.has(uri)) {
    return Promise.resolve(cache.get(uri));
  } else {
    return Cozy.parseURL(uri)
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