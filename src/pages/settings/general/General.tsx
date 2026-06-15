import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Label } from '@/ui/Label';

export const General = () => {

  const { t } = useTranslation('settings');

  return (
    <div className="space-y-8">
      <section className="p-6">
        <div className="flex flex-col gap-10">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{t('general.title')}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {t('general.description')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[300px_1fr] sm:items-center">
            <div className="text-sm space-y-2">
              <Label htmlFor="language-switcher">
                {t('general.language.label')}
              </Label>

              <p className="text-muted-foreground mt-1">
                {t('general.language.description')}
              </p>
            </div>

            <div className="flex items-center">
              <LanguageSwitcher 
                className="no-underline border h-9 px-4 rounded" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )

}