import { SyntheticEvent, useState } from 'react';

export const useImageDimensions = () => {

  const [dimensions, setDimensions] = useState<[number, number] | undefined>();

  const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!dimensions) {
      const { naturalWidth, naturalHeight } = event.target as HTMLImageElement;
      setDimensions([naturalWidth, naturalHeight]);
    }
  }

  return { onLoad, dimensions };

}