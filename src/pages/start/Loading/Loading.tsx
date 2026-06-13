import { useTranslation } from 'react-i18next';

export const Loading = () => {

  const { t } = useTranslation('start');

  return (
    <main className="h-dvh page grow start loading flex items-center justify-center text-muted-foreground text-sm">
      <div className="content-wrapper">
        <p className="mb-4 text-md">{t('loading')}</p>
      </div>
    </main>
  )

}
