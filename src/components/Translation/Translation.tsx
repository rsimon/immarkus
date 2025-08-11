import { useEffect, useState } from 'react';
import { Separator } from '@/ui/Separator';
import { deobfuscate } from '@/utils/obfuscateString';
import { Button } from '@/ui/Button';
import { Ban, X } from 'lucide-react';
import { Spinner } from '../Spinner';
import { 
  ServiceConnectorConfig, 
  TranslationServiceConfig, 
  TranslationServiceResponse, 
  useService 
} from '@/services';

interface TranslationProps {

  text: string;

  connector: ServiceConnectorConfig;

  service: TranslationServiceConfig;

  onClose(): void;

}

export const Translation = (props: TranslationProps) => {

  const { connector, connectorConfig, serviceConfig } = useService(props.connector.id, props.service);

  const [busy, setBusy] = useState(false);

  const [response, setResponse] = useState<TranslationServiceResponse | undefined>();

  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!serviceConfig || !connector) return;

    const storedParams = (connectorConfig.parameters || []).map(param => {
      const key = `immarkus:services:${connectorConfig.id}:${param.id}`;
      const value = deobfuscate(localStorage.getItem(key));
      return [param.id, value];
    }).filter(t => t[1]);

    const args = {
      ...(serviceConfig.arguments || {}),
      ...Object.fromEntries(storedParams)
    };

    setError(undefined);
    setBusy(true);

    connector.translate(props.text, args)
      .then(response => {
        setBusy(false);
        setResponse(response);
      }).catch(error => {
        console.error(error);

        setBusy(false);
        setError('Translation service error');
      });
  }, [connectorConfig, serviceConfig, connector]);

  return (
    <div>
      {busy ? (
        <div className="flex justify-center py-6">
          <Spinner className="size-4 text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex justify-center py-6 text-destructive items-center gap-1.5 text-xs">
          <Ban className="size-3.5" /> {error}
        </div>
      ) : response?.translation ? (
        <div className="px-2 py-1 text-muted-foreground/80 text-xs leading-relaxed">
          <Button
            variant="ghost"
            size="icon"
            className="float-right rounded-full p-1 size-8 -mr-2 ml-2 mb-2"
            onClick={props.onClose}>
            <X className="size-4" />
          </Button>

          <div className="pt-1.5 pb-2">
            {response.translation}
          </div>
        </div>
      ) : null}

      <Separator className="mb-1" />
    </div>
  )

}
