import { ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/Button';

interface IndexOutdatedProps {

  toAdd: number;

  onReindex(): void;

}

export const IndexOutdated = (props: IndexOutdatedProps) => {

  const { t } = useTranslation('settings');

  return (
    <div className="py-1.5">
      <div className="rounded-lg relative p-6 border border-red-700/30 bg-red-700/5 space-y-6 max-w-2xl">
        <div className="flex gap-2 items-center text-red-700 font-medium">
          <ShieldAlert className="size-5" />
          <p>
            {t('indexOutdated.title')}
          </p>
        </div>

        <div className="text-sm leading-relaxed text-red-700 space-y-3">
          <p>
            {t('indexOutdated.description')}
          </p>
        </div>

        <div className="flex flex-col items-center mt-11 mb-6 gap-10">
          <Button
            size="lg"
            variant="outline"
            className="relative border-red-700/30 bg-red-700/90 hover:bg-red-700/80 tracking-wide text-white hover:text-white"
            onClick={props.onReindex}>
            {t('indexOutdated.reindexButton', { count: props.toAdd })}
          </Button>

          <p className="text-xs text-red-800/60 leading-relaxed text-center max-w-lg">
            {t('indexOutdated.footnote')}
          </p>
        </div>
      </div>
    </div>
  )

}