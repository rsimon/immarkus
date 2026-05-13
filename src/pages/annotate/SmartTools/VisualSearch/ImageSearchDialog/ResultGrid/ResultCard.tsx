import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { Skeleton } from '@/ui/Skeleton';
import { cn } from '@/ui/utils';
import type { ResolvedSearchResult } from '../Types';
import { getImageColor, THIS_IMAGE_COLOR } from '../ImageSearchPalette';
import { useEmphasized } from './useEmphasized';

interface ResultCardProps {

  data: ResolvedSearchResult;

  onClick(): void;

  onPointerEnter(): void;

  onPointerLeave(): void;

}

export const ResultCard = (props: ResultCardProps) => {
  const { pxBounds, image, isQueryImage, score } = props.data;

  const aspectRatio = pxBounds[2] / pxBounds[3];

  const { isEmphasized, hasEmphasis } = useEmphasized(image.id);

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

    const controller = new AbortController();

    requestAnimationFrame(() => {
      getImageSnippet(image, annotation, true, 'jpg', false, controller.signal)
        .then(setSnippet)
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Failed to get image snippet:', err);
          }
        });
    });

    return () => {
      controller.abort();
    }
  }, [image, pxBounds, inView]);

  const src = useMemo(() => {
    if (!snippet) return;

    return 'data' in snippet 
      ? URL.createObjectURL(new Blob([snippet.data as BlobPart]))
      : snippet.src
  }, [snippet]);

  return (
    <button 
      ref={ref} 
      className={cn(
        'w-full flex relative p-1',
        (hasEmphasis && !isEmphasized) && 'opacity-20'
      )}
      onClick={props.onClick}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}>
      
      <div className="w-full overflow-hidden relative rounded border border-gray-300" style={{ aspectRatio }}>
        {src ? (
          <img
            className="absolute inset-0 w-full border-gray-300"
            src={src} 
            style={{ aspectRatio }} />
        ) : (
          <Skeleton
            className="bg-white size-full" />
        )}

        <div 
        className="size-3.5 absolute inset-1 rounded-full border border-white" 
        style={{ backgroundColor }} />

        <div
          className="absolute bottom-0 left-0 text-white text-[10px] bg-black/60 py-0.5 px-1.5 rounded-tr-xs">
          {Math.round(score * 100) / 100}
        </div>
      </div>
    </button>
  )

}