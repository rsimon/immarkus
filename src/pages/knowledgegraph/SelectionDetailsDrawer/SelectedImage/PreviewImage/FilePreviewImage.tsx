import { SyntheticEvent } from 'react';
import { LoadedFileImage } from '@/model';
import { Skeleton } from '@/ui/Skeleton';

interface FilePreviewImageProps {

  image?: LoadedFileImage;

  onLoad(event: SyntheticEvent<HTMLImageElement>): void;

}

export const FilePreviewImage = (props: FilePreviewImageProps) => {

  return props.image ? (
    <img 
      onLoad={props.onLoad}
      className="object-cover scale-105 object-center h-full w-full" 
      src={URL.createObjectURL(props.image.data)} />
  ) : (
    <Skeleton className="" />
  )
 
}