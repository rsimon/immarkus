import { LoadedImage } from '@/model';
import { useImages } from '@/store';

interface FilePreviewImageProps {

  id: string;

}

export const FilePreviewImage = (props: FilePreviewImageProps) => {

  const loaded = useImages(props.id) as LoadedImage;

  return null /* loaded ? (
    <img 
      onLoad={onLoad}
      className="object-cover scale-105 object-center h-full w-full" 
      src={URL.createObjectURL(loaded.data)} />
  ) : (
    <Skeleton className="" />
  ) */
 
}