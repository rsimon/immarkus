import { Image, LoadedImage } from '@/model';
import { useImages } from '@/store';

interface ThumbnailImageProps {

  image: Image;

  delay?: number;
  
}

export const ThumbnailImage = (props: ThumbnailImageProps) => {

  const { image, delay } = props;

  const loaded = useImages(props.image.id, { delay }) as LoadedImage;

  return loaded ? (
    <img
      src={URL.createObjectURL(loaded.data)}
      alt={image.name}
      className="h-auto w-auto object-cover aspect-square rounded-sm shadow" />
  ) : (
    <div>WAIT</div>
  )

}