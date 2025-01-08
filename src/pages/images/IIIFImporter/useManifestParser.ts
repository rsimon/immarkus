import { useCallback } from 'react';
import { identifyIIIF, parseIIIF } from './lib';

export const useManifestParser = () => {

  const identify = useCallback((url: string) => {
    return fetch(url)
      .then(res => res.json())
      .then(data => identifyIIIF(data));
  }, []);

  const parse = useCallback((url: string) => {
    return fetch(url)
      .then(res => res.json())
      .then(data => parseIIIF(data));
  }, []);

  return { identify, parse };

}