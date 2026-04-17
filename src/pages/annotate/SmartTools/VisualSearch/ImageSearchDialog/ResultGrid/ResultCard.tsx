import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { ResolvedSearchResult } from '../ImageSearchDialog';
import { getImageColor, THIS_IMAGE_COLOR } from '../ImageSearchPalette';
import { Skeleton } from '@/ui/Skeleton';

interface ResultCardProps {

  data: ResolvedSearchResult;

}

export const ResultCard = (props: ResultCardProps) => {

  const { pxBounds, image, isQueryImage, score } = props.data;

  const aspectRatio = pxBounds[2] / pxBounds[3];

  const [snippet, setSnippet] = useState<ImageSnippet | undefined>();

  const { ref, inView } = useInView();

  const backgroundColor = isQueryImage ? THIS_IMAGE_COLOR : getImageColor(image.id);
  
  useEffect(() => {
    if (!inView) return;

    const [x, y, w, h] = pxBounds;

    const annotation = boundsToAnnotation({
      minX: x, 
      minY: y,
      maxX: x + w,
      maxY: y + h
    });

    getImageSnippet(image, annotation, true, 'jpg')
      .then(setSnippet);
  }, [image, pxBounds, inView]);

  return (
    <div ref={ref} className="w-full relative rounded border border-gray-300 overflow-hidden">
      <Skeleton
        className="bg-white w-full" 
        style={{ aspectRatio }}/>

      {snippet && (
        <img
          className="absolute inset-0 w-full border-gray-300"
          src={'data' in snippet 
            ? URL.createObjectURL(new Blob([snippet.data as BlobPart]))
            : snippet.src
          } 
          style={{ aspectRatio }} />
      )}

      <div 
        className="size-3.5 absolute inset-1 rounded-full border border-white" 
        style={{ backgroundColor }} />

      <div
        className="absolute bottom-0 left-0 text-white text-[10px] bg-black/60 py-0.5 px-1.5 rounded-tr-xs">
        {Math.round(score * 100) / 100}
      </div>
    </div>
  )

}