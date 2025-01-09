import { Image, LoadedImage } from '@/model';
import { useImages } from '@/store';
import { Spinner } from '../Spinner';
import { getThumbnail } from '@/utils/iiif/lib/helpers';

interface ThumbnailProps {

  image: Image;

  delay?: number;
  
}

export const Thumbnail = (props: ThumbnailProps) => {

  const { image, delay } = props;

  const loaded = useImages(props.image.id, delay) as LoadedImage;

  const url = loaded && ('data' in loaded ? URL.createObjectURL(loaded.data) : getThumbnail(loaded.canvas, { size: 112 }));

  return loaded ? (
    <img
      src={url}
      alt={image.name}
      className="w-14 h-14 object-cover aspect-square rounded-sm shadow border border-black/20" />
  ) : (
    <div className="w-14 h-14 aspect-square bg-muted rounded-md flex justify-center items-center">
      <Spinner className="w-3 h-3 text-muted-foreground/80" />
    </div>
  )

}