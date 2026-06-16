import { useEffect, useState } from 'react';
import { Disc3, FileExclamationPoint } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Progress } from '@/ui/Progress';
import { IndexingProgress, VisualSearch } from '@/utils/useVisualSearch';

interface IndexingInProgressProps {

  vs: VisualSearch;

  onDone(errors: string[]): void;

}

const formatURL = (url: string, maxLength = 30) => {
  const stripped = url.replace(/^https?:\/\//, '');
  return stripped.length > maxLength
    ? stripped.slice(0, maxLength) + '...'
    : stripped;
}

export const IndexingInProgress = (props: IndexingInProgressProps) => {

  const { t } = useTranslation('settings');

  const [progress, setProgress] = useState<IndexingProgress>({ phase: 'initializing' });

  const [percentage, setPercentage] = useState(0);

  const errors = 'errors' in progress ? progress.errors : 0;

  useEffect(() => {
    props.vs.runIndexing(setProgress);
  }, []);

  useEffect(() => {
    if (progress.phase === 'indexing')
      setPercentage(Math.round(100 * progress.progress / progress.total)); 

    if (progress.phase === 'done')
      props.onDone(progress.failed);
  }, [progress]);

  return (
    <div className="text-sm space-y-6 py-1.5">
      <div className="rounded-lg relative p-4 border border-sky-600 bg-sky-600/5 text-sm space-y-10">
        <div className="flex gap-2 items-center text-sky-700 font-medium">
          <Disc3 className="size-5 animate-spin duration-2000" />
          <p>
            {t('indexing.title')}
          </p>

          {errors > 0 && (
            <div className="ml-1 flex gap-1 items-center text-xs font-normal text-red-600">
              <FileExclamationPoint className="size-4 mb-px" /> {errors.toLocaleString()} {t('indexing.errors')}
            </div>
          )}
        </div>

        <div className="text-xs text-center text-sky-700/70 space-y-4 pb-2">
          <Progress 
            value={percentage} 
            className="h-2.5 bg-white border border-sky-800/15 [&>div]:bg-sky-800" />

          {progress.phase === 'initializing' ? (
            <p>{t('indexing.initializing')}</p>
          ) : progress.phase === 'downloading_model' ? (
            <p>{t('indexing.downloadingModel', { model: formatURL(progress.model, 60) })}</p>
          ) : progress.phase === 'indexing' ? (
            <p>{t('indexing.processed', { progress: progress.progress.toLocaleString(), total: progress.total.toLocaleString() })}</p>
          ) : progress.phase === 'fetching' ? (
            <p>{t('indexing.fetchingIIIF', { url: formatURL(progress.url) })}</p>
          ) : (
            <p>{t('indexing.success', { total: progress.total })}</p>
          )}
        </div>
      </div>

      <p className="leading-relaxed font-light">
        <Trans
          ns="settings"
          i18nKey="indexing.keepOpen"
          components={{ b: <strong className="font-semibold" /> }} />
      </p>
    </div>
  )

}