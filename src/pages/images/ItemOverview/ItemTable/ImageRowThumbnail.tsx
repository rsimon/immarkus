import { LoadedFileImage } from '@/model';
import { useImageDimensions } from '@/utils/useImageDimensions';
import { useEffect } from 'react';

interface ImageRowThumbnailProps {

  image: LoadedFileImage;

  onLoadDimensions(dimensions: [number, number]): void;

}

export const ImageRowThumbnail = (props: ImageRowThumbnailProps) => {

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
      className="size-10 object-cover object-center aspect-square rounded-[2px] shadow"
    />
  )
  
}