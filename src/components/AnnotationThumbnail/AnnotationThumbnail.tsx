import { ImageAnnotation, W3CImageAnnotation } from '@annotorious/react';
import { useImageSnippet } from '@/store';
import { Skeleton } from '@/ui/Skeleton';
import { cn } from '@/ui/utils';
import { CSSProperties } from 'react';

interface AnnotationThumbnailProps {

  annotation: ImageAnnotation | W3CImageAnnotation | string;

  className?: string;

  style?: CSSProperties;

}

export const AnnotationThumbnail = (props: AnnotationThumbnailProps) => {

  const snippet = useImageSnippet(props.annotation);

  const clsImg = cn('w-14 h-14 object-cover aspect-square rounded-sm border', props.className);

  const clsSkeleton = cn('w-14 h-14 shrink-0', props.className);

  return snippet ? (
    <img
      loading="lazy"
      src={'src' in snippet 
        ? snippet.src
        : URL.createObjectURL(new Blob([snippet.data as BlobPart]))}
      className={clsImg} 
      style={props.style} />
  ) : (
    <Skeleton className={clsSkeleton} /> 
  )
  
}