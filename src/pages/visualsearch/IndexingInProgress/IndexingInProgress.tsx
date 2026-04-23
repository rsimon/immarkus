import { useEffect, useState } from 'react';
import { Disc3 } from 'lucide-react';
import { Progress } from '@/ui/Progress';
import { IndexingProgress, VisualSearch } from '@/utils/useVisualSearch';

interface IndexingInProgressProps {

  vs: VisualSearch;

  onDone(): void;

}

const formatURL = (url: string, maxLength = 30) => {
  const stripped = url.replace(/^https?:\/\//, '');
  return stripped.length > maxLength
    ? stripped.slice(0, maxLength) + '...'
    : stripped;
}

export const IndexingInProgress = (props: IndexingInProgressProps) => {

  const [progress, setProgress] = useState<IndexingProgress>({ phase: 'initializing' });

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    props.vs.runIndexing(setProgress);
  }, []);

  useEffect(() => {
    if ('progress' in progress)
      setPercentage(Math.round(100 * progress.progress / progress.total)); 

    if (progress.phase === 'done')
      props.onDone();
  }, [progress]);

  return (
    <div className="rounded-lg relative p-6 border border-sky-800/25 bg-sky-800/5 space-y-6 max-w-xl">
      <div className="flex gap-2 items-center text-sky-800 font-medium">
        <Disc3 className="size-5 animate-spin duration-2000" />
        <p>
          Indexing your images
        </p>
      </div>

      <p className="text-sm leading-relaxed text-sky-800">
        <strong className="font-semibold">Keep this page open while indexing completes.</strong> Indexing 
        runs locally in your browser and may take up to a minute per image.
      </p>

      <div className="text-xs text-center text-sky-950/60 space-y-3 pb-1">
        <Progress 
          value={percentage} 
          className="h-2.5 bg-white border border-sky-800/15 [&>div]:bg-sky-800" />

        {progress.phase === 'initializing' ? (
          <p>Initializing...</p>
        ) : progress.phase === 'indexing' ? (
          <p>Processed {progress.progress.toLocaleString()} of {progress.total.toLocaleString()} images</p>
        ) : progress.phase === 'fetching' ? (
          <p>Fetching IIIF: {formatURL(progress.url)}</p>
        ) : (
          <p>Sucessfully processed {progress.total} images</p>
        )}
      </div>
    </div>
  )

}