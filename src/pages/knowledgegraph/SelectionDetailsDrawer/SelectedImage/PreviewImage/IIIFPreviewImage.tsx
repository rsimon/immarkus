import { useEffect, useState } from 'react';
import { LoadedIIIFImage } from '@/model';
import { getStitchedThumbnail } from 'cozy-iiif/level-0';

interface IIIFPreviewImageProps {

  image?: LoadedIIIFImage;

}

export const IIIFPreviewImage = (props: IIIFPreviewImageProps) => {
  
  const [src, setSrc] = useState<string | undefined>();

  useEffect(() => {
    if (!props.image) return;

    const firstResource = props.image.canvas?.images[0];

    if (!firstResource || firstResource.type !== 'level0') {
      setSrc(props.image.canvas.getThumbnailURL());
    } else {
      getStitchedThumbnail(firstResource, { size: { w: 600, h: 400 }}).then(blob => {
        setSrc(URL.createObjectURL(blob));
      });
    }
  }, [props.image]);

  return props.image ? (
    <img 
      className="object-cover scale-105 object-center h-full w-full" 
      src={src} />
  ) : null;

}