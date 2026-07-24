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

  // Keep the object URL stable across re-renders so the <img> doesn't
  // reload (and flash back to the placeholder) every time an unrelated
  // row's dimensions load triggers a re-render of this table.
  const url = useMemo(() => URL.createObjectURL(props.image.data), [props.image.data]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  useEffect(() => {
    if (dimensions) props.onLoadDimensions(dimensions);
  }, [dimensions]);

  return (
    <div className="relative inline-block">
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