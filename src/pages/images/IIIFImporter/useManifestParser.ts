import { useCallback } from 'react';
import { identifyIIIF } from './lib';

export const useManifestParser = () => {

  const validate = useCallback((url: string) => {
    return fetch(url)
      .then(res => res.json())
      .then(data => identifyIIIF(data));
  }, []);

  return { validate };

}