import { LoadedIIIFImage } from '@/model';
import { getThumbnail } from '@/utils/iiif/lib/helpers';
import { useMemo } from 'react';

interface IIIFPreviewImageProps {

  image?: LoadedIIIFImage;

}

export const IIIFPreviewImage = (props: IIIFPreviewImageProps) => {

  const src = useMemo(() => {
    if (!props.image) return;

    return getThumbnail(props.image.canvas, { size: 400 });
  }, [props.image]);

  return props.image ? (
    <img 
      className="object-cover scale-105 object-center h-full w-full" 
      src={src} />
  ) : null;

}