import { useCallback } from 'react';
import { parseIIIF } from './lib';

export const useManifestParser = () => {

  const validate = useCallback((url: string) => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const { result } = parseIIIF(data);

        console.log(result);
      });
  }, []);

  return { validate };

}