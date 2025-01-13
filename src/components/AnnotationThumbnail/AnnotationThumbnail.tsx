import { ImageAnnotation, W3CImageAnnotation } from '@annotorious/react';
import { useImageSnippet } from '@/store';
import { Skeleton } from '@/ui/Skeleton';
import { cn } from '@/ui/utils';

interface AnnotationThumbnailProps {

  annotation: ImageAnnotation | W3CImageAnnotation | string;

  className?: string;

}

export const AnnotationThumbnail = (props: AnnotationThumbnailProps) => {

  const snippet = useImageSnippet(props.annotation);

  const clsImg = cn('w-14 h-14 object-cover aspect-square rounded-sm border', props.className);

  const clsSkeleton = cn('w-14 h-14 flex-shrink-0', props.className);

  return snippet ? (
    <img
      loading="lazy"
      src={URL.createObjectURL(new Blob([snippet.data]))}
      className={clsImg} />
  ) : (
    <Skeleton className={clsSkeleton} /> 
  )
  
}