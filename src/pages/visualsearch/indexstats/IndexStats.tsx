import { useMemo } from 'react';
import { VisualSearch } from '../useVisualSearch';

interface IndexStatsProps {

  vs: VisualSearch;

}

export const IndexStats = (props: IndexStatsProps) => {

  const { images, embeddings } = props.vs.index;

  const segments = useMemo(() => 
    images.flatMap(i => i.segments).length, [images]);

  return (
    <div>
      <ul>
        <li>{images.length.toLocaleString()} images</li>
        <li>{embeddings.length.toLocaleString()} embedding vectors</li>
        <li>{segments.toLocaleString()} segments</li>
      </ul>
    </div>
  )

}