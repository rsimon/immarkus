import { useMemo } from 'react';
import { CozyCanvas } from 'cozy-iiif';
import { useInView } from 'react-intersection-observer';

interface IIIFManifestTableRowThumbnailProps {

  canvas: CozyCanvas;

}

export const IIIFManifestTableRowThumbnail = (props: IIIFManifestTableRowThumbnailProps) => {

  const { ref, inView } = useInView();

  const src = useMemo(() => props.canvas.getThumbnailURL(), [props.canvas]);

  return (
    <div ref={ref}>
      {inView ? (
        <img
          src={src}
          className="size-10 bg-muted object-cover object-center aspect-square rounded-[2px] border" />
      ) : (
        <div className="size-10 bg-muted rounded-[2px] border" />
      )}
    </div>
  )
}