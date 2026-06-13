import { AlertCircle } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, AlertTitle, AlertDescription } from '@/ui/Alert';

export const UnsupportedBrowser = () => {

  const { t } = useTranslation('start');

  return (
    <main className="h-dvh page start unsupported w-full flex items-center justify-center">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('unsupportedBrowser.title')}</AlertTitle>
        <AlertDescription className="leading-6 mt-2">
          <Trans
            ns="start"
            i18nKey="unsupportedBrowser.description"
            components={{
              featuresLink: <a className="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker" target="_blank" />
            }} />
        </AlertDescription>
      </Alert>
    </main>
  )

}
