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

  const columnWidth = iconSize === 'sm' ? 90 : iconSize === 'md' ? 160 : 280;

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

  const avgHeight = useMemo(() => {
    if (results.length === 0) return 300;
    const total = results.reduce<number>((total, r) => {
      const [, , w, h] = r.pxBounds;
      return total + (h / w) * columnWidth;
    }, 0);
    return total / results.length;
  }, [results, columnWidth]);

  return (
    <HoveredImageIdProvider 
      hoveredId={hoveredImage?.id}>
      <Masonry
        items={results}
        columnGutter={0}
        columnWidth={columnWidth}
        overscanBy={20}
        itemHeightEstimate={avgHeight}
        rowGutter={0}
        render={renderCard} />
    </HoveredImageIdProvider>
  )

}