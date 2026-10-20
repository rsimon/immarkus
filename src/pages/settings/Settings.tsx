import { useTranslation } from 'react-i18next';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { NavTabItem } from '@/components/NavTabItem';
import { Separator } from '@/ui/Separator';
import { General } from './general';
import { Translation } from './translation/Translation';
import { VisualSearch } from './visualsearch';

interface SettingsProps {

  tab: 'general' | 'visual-search' | 'translation';

}

export const Settings = (props: SettingsProps) => {

  const { t } = useTranslation('settings');

  return (
    <>
      <AppNavigationSidebar />

      <main className="grow page export px-12 py-6 overflow-auto">
        <div>
          <h1 className="text-xl font-semibold tracking-tight mb-2">
            {t('title')}
          </h1>

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
                  path="/settings/general"
                  label={t('nav.general')}
                  active={props.tab === 'general'} />

                <NavTabItem
                  path="/settings/visual-search"
                  label={t('nav.visualSearch')}
                  active={props.tab === 'visual-search'} />

                <NavTabItem
                  path="/settings/translation"
                  label={t('nav.translation')}
                  active={props.tab === 'translation'} />
              </ol>
            </nav>
          </aside>

          <section className="pl-12 py-0.5 grow">
            {props.tab === 'general' ? (
              <General />
            ) : props.tab === 'visual-search' ? (
              <VisualSearch />   
            ) : (
              <Translation />
            )}
          </section>
        </div>
      </main>
    </>
  )

}