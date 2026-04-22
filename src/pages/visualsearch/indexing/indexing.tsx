import { useEffect, useState } from 'react';
import { IndexingProgress, VisualSearch } from '../../../utils/useVisualSearch';

interface IndexingProps {

  vs: VisualSearch;

  onDone(): void;

}

export const Indexing = (props: IndexingProps) => {

  const [progress, setProgress] = useState<IndexingProgress>({ phase: 'initializing' });

  useEffect(() => {
    props.vs.runIndexing(setProgress);
  }, []);

  return (
    <div>
      {JSON.stringify(progress)}
    </div>
  )

}