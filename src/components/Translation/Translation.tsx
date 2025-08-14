import { useEffect, useState } from 'react';
import { Ban, Check, Copy, X } from 'lucide-react';
import { TranslationServiceResponse, useService } from '@/services';
import { Separator } from '@/ui/Separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { deobfuscate } from '@/utils/obfuscateString';
import { Spinner } from '../Spinner';
import { TranslationArgs } from './TranslationArgs';

interface TranslationProps {

  args: TranslationArgs;

  onClose(): void;

}

export const Translation = (props: TranslationProps) => {

  const { connector, connectorConfig, serviceConfig } = useService(props.args.connector.id, props.args.service);

  const [busy, setBusy] = useState(true);

  const [response, setResponse] = useState<TranslationServiceResponse | undefined>();

  const [error, setError] = useState<string | undefined>();

  const [copied, setCopied] = useState(false);

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

    connector.translate(props.args.text, props.args.language, args)
      .then(response => {
        setBusy(false);
        setResponse(response);
      }).catch(error => {
        console.error(error);

        setBusy(false);
        setError('Translation service error');
      });
  }, [connectorConfig, serviceConfig, connector, props.args.text]);

  const onCopyToClipboard = () => {
    navigator.clipboard.writeText(response.translation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 750);
    });
  }

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
        <div className="px-1 py-1 text-muted-foreground/80 text-xs leading-relaxed">
          <div className="flex justify-end pt-4 pb-2 gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="hover:text-primary"
                  onClick={onCopyToClipboard}>
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </TooltipTrigger>

              <TooltipContent>
                Copy to clipboard
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="hover:text-primary"
                  onClick={props.onClose}>
                  <X className="size-3.5" />
                </button>
              </TooltipTrigger>

              <TooltipContent>
                Hide translation
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="pb-2 whitespace-pre-wrap">
            {response.translation}
          </div>
        </div>
      ) : null}

      <Separator className="mb-1" />
    </div>
  )

}
