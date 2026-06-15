import { useTranslation } from 'react-i18next';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { NavTabItem } from '@/components/NavTabItem';
import { Separator } from '@/ui/Separator';
import { ExportAnnotations } from './ExportAnnotations';
import { ExportDataModel } from './ExportDataModel';
import { ExportMetadata } from './ExportMetadata';
import { ExportRelationships } from './ExportRelationships';

interface ExportProps {
  
  tab: 'annotations' | 'relationships' | 'model' | 'metadata';

}

export const Export = (props: ExportProps) => {

  const { t } = useTranslation('export');

  return (
    <>
      <AppNavigationSidebar />

      <main className="grow page export px-12 py-6 overflow-auto">
        <div>
          <h1 className="text-xl font-semibold tracking-tight mb-2">{t('title')}</h1>

          <p className="mt-1 text-sm leading-6">
            {t('description')}
          </p>

          <Separator className="mt-7 w-full mb-2" />
        </div>

        <div className="flex">
          <aside className="py-4">
            <nav className="w-44">
              <ol>
                <NavTabItem
                  path="/export/annotations"
                  label={t('nav.annotations')}
                  active={props.tab === 'annotations'} />

                <NavTabItem
                  path="/export/relationships"
                  label={t('nav.relationships')}
                  active={props.tab === 'relationships'} />

                <NavTabItem
                  path="/export/model"
                  label={t('nav.dataModel')}
                  active={props.tab === 'model'} />

                <NavTabItem
                  path="/export/metadata"
                  label={t('nav.metadata')}
                  active={props.tab === 'metadata'} />
              </ol>
            </nav>
          </aside>

          <section className="pl-12 py-2 grow">
            {props.tab === 'annotations' ? (
              <ExportAnnotations />
            ) : props.tab === 'relationships' ? (
              <ExportRelationships />
            ) : props.tab === 'model' ? (
              <ExportDataModel />
            ) : props.tab === 'metadata' ? (
              <ExportMetadata />
            ) : null}
          </section>
        </div>
      </main>
    </>
  )
}