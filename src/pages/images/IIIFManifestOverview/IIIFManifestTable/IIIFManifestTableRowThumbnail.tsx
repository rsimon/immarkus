import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { IsInWorkspaceIndicatorPip } from '../../IsInWorkspaceIndicator';
import { CanvasItem } from '../../Types';

interface IIIFManifestTableRowThumbnailProps {

  item: CanvasItem;

}

export const IIIFManifestTableRowThumbnail = (props: IIIFManifestTableRowThumbnailProps) => {

  const { ref, inView } = useInView();

  const { canvas, info } = props.item;

  const src = useMemo(() => canvas.getThumbnailURL(), [canvas]);

  const id = `iiif:${info.manifestId}:${info.id}`;

  return (
    <div ref={ref} className="relative">
      {inView ? (
        <img
          src={src}
          className="size-10 bg-muted object-cover object-center aspect-square rounded-[2px] border" />
      ) : (
        <div className="size-10 bg-muted rounded-[2px] border" />
      )}

      <IsInWorkspaceIndicatorPip imageId={id} />
    </div>
  )
}