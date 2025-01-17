import { LoadedIIIFImage } from '@/model';
import { useMemo } from 'react';

interface IIIFPreviewImageProps {

  image?: LoadedIIIFImage;

}

export const IIIFPreviewImage = (props: IIIFPreviewImageProps) => {

  const src = useMemo(() => {
    if (!props.image) return;

    return props.image.canvas.getThumbnailURL(600);
  }, [props.image]);

  return props.image ? (
    <img 
      className="object-cover scale-105 object-center h-full w-full" 
      src={src} />
  ) : null;

}