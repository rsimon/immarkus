import { Masonry } from 'masonic';
import type { IconSize, ResolvedSearchResult } from '../ImageSearchDialog';
import { ResultCard } from './ResultCard';

interface ResultGridProps {

  iconSize: IconSize

  sourceImageId: string;
  
  results: ResolvedSearchResult[];

}

export const ResultGrid = (props: ResultGridProps) => {

  const { results, iconSize } = props;

  return (
    <Masonry
      items={results}
      columnGutter={12}
      columnWidth={iconSize === 'sm' ? 90 : iconSize === 'md' ? 160 : 280}
      overscanBy={Infinity}
      render={ResultCard} />
  )

}