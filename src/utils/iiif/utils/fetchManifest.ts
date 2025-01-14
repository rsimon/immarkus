import { parseIIIF } from '../lib';
import { IIIFParseResult } from '../lib/Types';

const cache = new Map<string, IIIFParseResult>();

export const fetchManifest = (uri: string) => {

  if (cache.has(uri)) {
    return Promise.resolve(cache.get(uri));
  } else {
    return fetch(uri)
      .then(res => res.json())
      .then(data => {
        const { error, result } = parseIIIF(data);
        if (error || !result) {
          console.error(error);
        } else {
          cache.set(uri, result);
          return result;
        }
      });
  }

}