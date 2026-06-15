import { BadgeCheck, PanelsTopLeft } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { Button } from '@/ui/Button';
import { VisualSearch } from '@/utils/useVisualSearch';

interface IndexReadyProps {

  vs: VisualSearch;

}

export const IndexReady = (props: IndexReadyProps) => {

  const { t } = useTranslation('settings');

  const { images, embeddings } = props.vs.index;

  const onDeleteIndex = () => props.vs.deleteIndex();

  return (
    <div className="py-1.5">
      <div className="relative text-sm space-y-6">
        <div className="flex gap-2 items-center font-medium rounded-lg p-4 border border-green-600 bg-green-600/5 text-green-700">
          <BadgeCheck className="size-5" />
          <p>
            {t('indexReady.title')}
          </p>
        </div>

        <div className="space-y-2">
          <p className="leading-relaxed">
            <Trans
              ns="settings"
              i18nKey="indexReady.description"
              components={{
                b: <strong className="font-semibold" />,
                wsIcon: <PanelsTopLeft className="size-3.5 inline mb-0.5" strokeWidth={2.25} />
              }} />
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            {t('indexReady.stats', { images: images.length.toLocaleString(), objects: embeddings.length.toLocaleString() })}
          </p>
        </div>
      </div>

      <h2 className="mt-14 font-medium text-lg">{t('indexReady.dangerZone')}</h2>

      <div className="mt-2 border border-red-400/30 rounded-lg p-5">
        <section className="flex flex-col gap-4 lg:flex-row justify-between text-sm">
          <div className="leading-relaxed">
            <h3 className="font-semibold">{t('indexReady.deleteIndexTitle')}</h3>
            <p className="text-muted-foreground">
              {t('indexReady.deleteIndexDescription')}
            </p>
          </div>

          <ConfirmedDelete
            message={t('indexReady.deleteIndexConfirm')}
            onConfirm={onDeleteIndex} asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-muted text-red-500 hover:text-red-600  whitespace-nowrap">
              {t('indexReady.deleteIndexButton')}
            </Button>
          </ConfirmedDelete>
        </section>
      </div>
    </div>
  )

}