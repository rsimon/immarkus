import { useCallback, useMemo, useRef } from 'react';
import { Masonry, type RenderComponentProps } from 'masonic';
import { LoadedImage } from '@/model';
import type { IconSize, ResolvedSearchResult } from '../Types';
import { ResultCard } from './ResultCard';
import { HoveredImageIdProvider } from './useEmphasized';

interface ResultGridProps {

  hoveredImage?: LoadedImage;

  iconSize: IconSize

  sourceImageId: string;
  
  results: ResolvedSearchResult[];

  onSelectResult(result: ResolvedSearchResult): void;

  onHover(image?: ResolvedSearchResult): void;

}

export const ResultGrid = (props: ResultGridProps) => {
  const { hoveredImage, results, iconSize, onSelectResult, onHover } = props;

  const onSelectResultRef = useRef(onSelectResult);
  onSelectResultRef.current = onSelectResult;

  const onHoverRef = useRef(onHover);
  onHoverRef.current = onHover;

  const renderCard = useCallback((cardProps: RenderComponentProps<ResolvedSearchResult>) => (
    <ResultCard
      data={cardProps.data}
      onClick={() => onSelectResultRef.current(cardProps.data)}
      onPointerEnter={() => onHoverRef.current(cardProps.data)}
      onPointerLeave={() => onHoverRef.current(undefined)}
    />
  ), []);

  const maxHeight = useMemo(() => {
    const heights = results.map(r => r.pxBounds[3]);
    return Math.max(...heights);
  }, [results]);

  return (
    <HoveredImageIdProvider 
      hoveredId={hoveredImage?.id}>
      <Masonry
        items={results}
        columnGutter={12}
        columnWidth={iconSize === 'sm' ? 90 : iconSize === 'md' ? 160 : 280}
        overscanBy={10}
        itemHeightEstimate={maxHeight}
        rowGutter={12}
        render={renderCard} />
    </HoveredImageIdProvider>
  )

}