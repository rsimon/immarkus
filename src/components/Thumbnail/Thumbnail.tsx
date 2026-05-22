import { useInView } from 'react-intersection-observer';
import { CanvasInformation, FileImage, LoadedImage } from '@/model';
import { useImages } from '@/store';
import { Spinner } from '../Spinner';
import { cn } from '@/ui/utils';
import { useMemo } from 'react';

interface ThumbnailProps {

  image: FileImage | CanvasInformation;

  delay?: number;

  size?: number;

  className?: string;
  
}

const ThumbnailImage = (props: ThumbnailProps) => {

  const { image, delay } = props;

  const id = 'file' in image ? image.id : `iiif:${image.manifestId}:${image.id}`;

  const loaded = useImages(id, delay) as LoadedImage;

  const url = useMemo(() => loaded && (
    'data' in loaded 
      ? URL.createObjectURL(loaded.data) 
      : loaded.canvas.getThumbnailURL(props.size || 112)), [loaded, props.size]);

  return loaded ? (
    <img
      src={url}
      alt={image.name}
      className={cn(
        'size-full object-cover aspect-square rounded-sm shadow-sm border border-black/20',
        props.className
      )} />
  ) : (
    <Spinner className="w-3 h-3 text-muted-foreground/80" />
  )

}

export const Thumbnail = (props: ThumbnailProps) => {

  const { ref, inView } = useInView();

  return (
    <div 
      ref={ref} 
      className={cn(
        'w-14 h-14 aspect-square bg-muted rounded-md flex justify-center items-center relative',
        props.className
      )}>
      {inView && (
        <ThumbnailImage {...props} />
      )}
    </div>
  )

}