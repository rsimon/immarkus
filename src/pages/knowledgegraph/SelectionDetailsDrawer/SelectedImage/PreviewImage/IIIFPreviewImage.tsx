import { LoadedIIIFImage } from '@/model';
import { getThumbnailURL } from '@/utils/cozy-iiif';
import { useMemo } from 'react';

interface IIIFPreviewImageProps {

  image?: LoadedIIIFImage;

}

export const IIIFPreviewImage = (props: IIIFPreviewImageProps) => {

  const src = useMemo(() => {
    if (!props.image) return;

    return getThumbnailURL(props.image.canvas, 600);
  }, [props.image]);

  return props.image ? (
    <img 
      className="object-cover scale-105 object-center h-full w-full" 
      src={src} />
  ) : null;

}