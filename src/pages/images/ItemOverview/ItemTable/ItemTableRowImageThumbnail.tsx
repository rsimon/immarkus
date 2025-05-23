import { LoadedFileImage } from '@/model';
import { useImageDimensions } from '@/utils/useImageDimensions';
import { useEffect } from 'react';

interface ItemTableRowImageThumbnailProps {

  image: LoadedFileImage;

  onLoadDimensions(dimensions: [number, number]): void;

}

export const ItemTableRowImageThumbnail = (props: ItemTableRowImageThumbnailProps) => {

  const { onLoad, dimensions } = useImageDimensions();

  useEffect(() => {
    if (dimensions) props.onLoadDimensions(dimensions);
  }, [dimensions]);

  return (
    <img
      onLoad={onLoad}
      loading="lazy"
      src={URL.createObjectURL(props.image.data)}
      alt={props.image.name}
      className="size-10 bg-muted object-cover object-center aspect-square rounded-[2px] border"
    />
  )
  
}