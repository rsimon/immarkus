import { useEffect, useState } from 'react';
import { Check, CircleX, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/Spinner';
import { TranslationSettings } from '@/components/Translation';
import { useService } from '@/services';
import { Button } from '@/ui/Button';
import { cn } from '@/ui/utils';
import { deobfuscate } from '@/utils/obfuscateString';

interface TestButtonProps {

  settings: TranslationSettings;

}

type Result = 'SUCCESS' | 'ERROR';

const TEST_STRING = 'This is a test';
const TEST_LANG = 'nl';

export const TestButton = (props: TestButtonProps) => {
  const { settings } = props; 

  const { t } = useTranslation('settings');

  const { connector, connectorConfig, serviceConfig } = useService(settings.connector.id, settings.service);

  const storedParams = (connectorConfig?.parameters || []).map(param => {
    const key = `immarkus:services:${connectorConfig.id}:${param.id}`;
    const obfuscated = localStorage.getItem(key);
    if (!obfuscated) return [];

    const value = deobfuscate(localStorage.getItem(key));
    return [param.id, value];
  }).filter(t => t[1]);

  const args = {
    ...(serviceConfig?.arguments || {}),
    ...Object.fromEntries(storedParams)
  };

  const hasKey = Object.keys(args).includes('api-key') && Boolean(args['api-key'].trim());

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | undefined>();

  useEffect(() => {
    setBusy(false);
    setResult(undefined);
  }, [props.settings]);

  const onTest = () => {
    setBusy(true);

    connector.translate(TEST_STRING, TEST_LANG, args)
      .then(() => {
        setBusy(false);
        setResult('SUCCESS');
      }).catch(error => {
        console.error(error);
        setBusy(false);
        setResult('ERROR');
      });
  }

  return (
    <div className="space-y-3">
      <Button
        disabled={!hasKey}
        variant="outline"
        className={cn(
          'gap-2 text-xs font-normal',
          result === 'SUCCESS' ? 'text-green-700 hover:text-green-700 border-green-600 bg-green-50' : 
          result === 'ERROR' ? 'text-destructive hover:text-destructive border-destructive bg-red-50' : undefined
        )}
        size="sm"
        onClick={onTest}>
        {busy ? (
          <>
            <Spinner className="text-foreground size-3.5" /> {t('translation.test.testing')}
          </>
        ) : result === 'SUCCESS' ? (
          <>
            <Check className="size-4" /> {t('translation.test.success')}
          </>
        ) : result === 'ERROR' ? (
            <>
              <CircleX className="size-4" /> {t('translation.test.error')}
            </>
        ) : (
          <>
            <KeyRound className="size-3.5" /> {t('translation.test.testKey')}
          </>
        )}
      </Button>

      <p className="text-xs leading-relaxed text-muted-foreground max-w-sm pl-0.5">
        {t('translation.test.hint')}
      </p>
    </div>
  )

}