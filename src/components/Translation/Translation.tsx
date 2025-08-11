import { useEffect, useState } from 'react';
import { ServiceConnectorConfig, TranslationServiceResponse, useService } from '@/services';
import { Separator } from '@/ui/Separator';
import { deobfuscate } from '@/utils/obfuscateString';

interface TranslationProps {

  text: string;

  connector: ServiceConnectorConfig;

}

export const Translation = (props: TranslationProps) => {

  const { connector: connectorConfig } = props;

  const { serviceConfig, connector } = useService(connectorConfig.id, 'TRANSLATION');

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

    setBusy(true);

    connector.translate(props.text, Object.fromEntries(storedParams))
      .then(response => {
        setBusy(false);
        setResponse(response);
      }).catch(error => {
        console.error(error);

        setBusy(false);
        setError('Translation service error');
      })
  }, [connectorConfig, serviceConfig, connector]);

  return (
    <div>
      {busy ? (
        <div>Translating...</div>
      ) : error ? (
        <div>Error! {error}</div>
      ) : response?.translation ? (
        <div className="p-2 text-muted-foreground/80 text-xs leading-relaxed">
          {response.translation}
        </div>
      ) : null}

      <Separator className="mb-1" />
    </div>
  )

}
