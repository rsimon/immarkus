import { useCallback } from 'react';
import { Masonry, type RenderComponentProps } from 'masonic';
import type { IconSize, ResolvedSearchResult } from '../ImageSearchDialog';
import { ResultCard } from './ResultCard';

interface ResultGridProps {

  iconSize: IconSize

  sourceImageId: string;
  
  results: ResolvedSearchResult[];

  onSelectResult(result: ResolvedSearchResult): void;

}

export const ResultGrid = (props: ResultGridProps) => {

  const { results, iconSize, onSelectResult } = props;

  const renderCard = useCallback((props: RenderComponentProps<ResolvedSearchResult>) => (
    <ResultCard data={props.data} onClick={() => onSelectResult(props.data)} />
  ), []);

  return (
    <Masonry
      items={results}
      columnGutter={12}
      columnWidth={iconSize === 'sm' ? 90 : iconSize === 'md' ? 160 : 280}
      overscanBy={Infinity}
      render={renderCard} />
  )

}