import { useCallback, useRef } from 'react';
import { Masonry, type RenderComponentProps } from 'masonic';
import { LoadedImage } from '@/model';
import type { IconSize, ResolvedSearchResult } from '../Types';
import { ResultCard } from './ResultCard';
import { HoveredImageIdContext } from './useEmphasized';

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

  return (
    <HoveredImageIdContext.Provider 
      value={hoveredImage?.id}>
      <Masonry
        items={results}
        columnGutter={12}
        columnWidth={iconSize === 'sm' ? 90 : iconSize === 'md' ? 160 : 280}
        overscanBy={Infinity}
        render={renderCard} />
    </HoveredImageIdContext.Provider>
  )

}