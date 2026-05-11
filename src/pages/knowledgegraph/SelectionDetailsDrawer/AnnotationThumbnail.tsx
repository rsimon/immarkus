import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { W3CImageAnnotation } from '@annotorious/react';
import { LoadedImage } from '@/model';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { cn } from '@/ui/utils';
import { Skeleton } from '@/ui/Skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/ui/HoverCard';

interface AnnotationThumbnailProps {

  annotation: W3CImageAnnotation;

  className?: string;

  image: LoadedImage;

}

export const AnnotationThumbnail = (props: AnnotationThumbnailProps) => {

  const { ref, inView } = useInView();

  const [snippet, setSnippet] = useState<ImageSnippet | undefined>();

  const clsImg = cn('w-14 h-14 object-cover aspect-square rounded-sm border', props.className);

  const clsSkeleton = cn('w-14 h-14 shrink-0', props.className);

  useEffect(() => {
    if (!inView || !props.image) return;
    
    setSnippet(undefined);

    setTimeout(() => getImageSnippet(props.image, props.annotation).then(setSnippet), 200);
  }, [props.annotation, inView, props.image]);

  return (
    <div ref={ref} key={props.annotation.id}>
      {snippet ? (
        <HoverCard
          openDelay={150}>
          <HoverCardTrigger>
            <img
              src={'src' in snippet 
                ? snippet.src
                : URL.createObjectURL(new Blob([snippet.data as BlobPart]))}
              className={clsImg} />
          </HoverCardTrigger>

          <HoverCardContent 
            className="p-0 shadow-xl border-none overflow-hidden min-w-0 w-auto"
            align="center"
            side="left"
            collisionPadding={20}>
            <img src={'src' in snippet 
                ? snippet.src
                : URL.createObjectURL(new Blob([snippet.data as BlobPart]))} 
                className="rounded max-w-70 max-h-70" />
          </HoverCardContent>
        </HoverCard>
      ) : (
        <Skeleton className={clsSkeleton} /> 
      )}
    </div>
  )

}