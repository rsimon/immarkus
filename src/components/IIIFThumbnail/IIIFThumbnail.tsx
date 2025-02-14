import { useEffect, useState } from 'react';
import { CozyCanvas } from '@/utils/cozy-iiif';
import { getThumbnail } from '@/utils/cozy-iiif/level-0';

interface IIIFThumbnailProps {

  canvas: CozyCanvas;

  className?: string;

  onClick?(): void;

}

export const IIIFThumbnail = (props: IIIFThumbnailProps) => {

  const [src, setSrc] = useState<string | undefined>();

  useEffect(() => {
    const firstImage = props.canvas.images[0];

    if (!firstImage || firstImage.type !== 'level0') {
      setSrc(props.canvas.getThumbnailURL());
    } else {
      getThumbnail(firstImage).then(blob => {
        setSrc(URL.createObjectURL(blob));
      });
    }
  }, [props.canvas]);

  return (
    <img
      src={src}
      className={props.className}
      onClick={props.onClick} />
  )

}