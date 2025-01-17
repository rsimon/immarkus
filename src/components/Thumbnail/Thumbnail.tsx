import { useInView } from 'react-intersection-observer';
import { CanvasInformation, FileImage, LoadedImage } from '@/model';
import { useImages } from '@/store';
import { Spinner } from '../Spinner';

interface ThumbnailProps {

  image: FileImage | CanvasInformation;

  delay?: number;
  
}

const ThumbnailImage = (props: ThumbnailProps) => {

  const { image, delay } = props;

  const id = 'file' in image ? image.id : `iiif:${image.manifestId}:${image.id}`;

  const loaded = useImages(id, delay) as LoadedImage;

  const url = loaded && (
    'data' in loaded 
      ? URL.createObjectURL(loaded.data) 
      : loaded.canvas.getThumbnailURL(112));

  return loaded ? (
    <img
      src={url}
      alt={image.name}
      className="w-14 h-14 object-cover aspect-square rounded-sm shadow border border-black/20" />
  ) : (
    <Spinner className="w-3 h-3 text-muted-foreground/80" />
  )

}

export const Thumbnail = (props: ThumbnailProps) => {

  const { ref, inView } = useInView();

  return (
    <div ref={ref} className="w-14 h-14 aspect-square bg-muted rounded-md flex justify-center items-center">
      {inView && (
        <ThumbnailImage {...props} />
      )}
    </div>
  )

}