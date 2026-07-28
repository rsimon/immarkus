import { useEffect, useMemo } from 'react';
import { LoadedFileImage } from '@/model';
import { useImageDimensions } from '@/utils/useImageDimensions';
import { IsInWorkspaceIndicatorPip } from '../../IsInWorkspaceIndicator';

interface ItemTableRowImageThumbnailProps {

  image: LoadedFileImage;

  onLoadDimensions(dimensions: [number, number]): void;

}

export const ItemTableRowImageThumbnail = (props: ItemTableRowImageThumbnailProps) => {

  const { onLoad, dimensions } = useImageDimensions();

  const url = useMemo(() => URL.createObjectURL(props.image.data), [props.image.data]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  useEffect(() => {
    if (dimensions) props.onLoadDimensions(dimensions);
  }, [dimensions]);

  return (
    <div className="relative block w-fit">
      <img
        onLoad={onLoad}
        loading="lazy"
        src={url}
        alt={props.image.name}
        className="size-10 bg-muted object-cover object-center aspect-square rounded-[2px] border"
      />

      <IsInWorkspaceIndicatorPip imageId={props.image.id} />
    </div>
  )

}