import { useCallback } from 'react';
import { parseIIIF } from './lib';
import { getOSDTilesets } from './lib/openseadragon';
import { getImages } from './lib/helpers/imageHelper';

export const useManifestParser = () => {

  const validate = useCallback((url: string) => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const { result } = parseIIIF(data);
        const { parsed } = result;
        console.log(getImages(parsed[0]));
      });
  }, []);

  return { validate };

}