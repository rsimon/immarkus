import { IIIFThumbnail } from '@/components/IIIFThumbnail';
import { IIIFManifestResource } from '@/model';
import { useCanvas } from '@/utils/iiif/hooks';
import { IsInWorkspacePip } from './IsInWorkspacePip';

interface ItemTableRowCanvasThumbnailProps {

  manifest: IIIFManifestResource;

}

export const ItemTableRowCanvasThumbnail = (props: ItemTableRowCanvasThumbnailProps) => {

  const info = props.manifest.canvases[0];

  const id = `iiif:${info.manifestId}:${info.id}`;

  const canvas = useCanvas(id);

  return (
    <div className="relative inline-block">
      {canvas ? (
        <IIIFThumbnail
          canvas={canvas}
          className="size-10 bg-muted object-cover object-center aspect-square rounded-[2px] border" />
      ) : (
        <div className="size-10 bg-muted rounded-[2px] border" />
      )}

      <IsInWorkspacePip imageId={id} />
    </div>
  )

}