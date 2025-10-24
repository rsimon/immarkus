import { useEffect, useMemo, useState } from 'react';
import { Languages } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { ServiceConnectorConfig, ServiceRegistry } from '@/services';
import { cn } from '@/ui/utils';
import { TranslateSettingsPopover } from './TranslateSettingsPopover';
import { TranslationSettings } from './Types';
import { usePersistentState } from '@/utils/usePersistentState';

interface TranslateButtonProps {

  disabled?: boolean; 

  onClickTranslate(settings: TranslationSettings): void;

}

const KEY_SERVICE = 'immarkus:annotate:translation-service';
const KEY_LANGUAGE = 'immarkus:annotate:translation-language'

const connectors = ServiceRegistry.listAvailableConnectors('TRANSLATION');

const getInitialService = (available: ServiceConnectorConfig[]): TranslationSettings => {
  const getFirst = () => {
    const connector = available[0];
    const service = connector?.services.find(s => s.type === 'TRANSLATION');
    return { connector, service, index: 0 };
  }

  const persistedId = localStorage.getItem(KEY_SERVICE);
  if (!persistedId) return getFirst();

  const [connectorId, index] = persistedId.split('::');

  const connector = available.find(c => c.id === connectorId);
  if (!connector) return getFirst();

  try {
    const parsed = parseInt(index);
    const service = connector.services.filter(s => s.type === 'TRANSLATION')[parsed];
    return service ? { connector, service, index: parsed } : getFirst();
  } catch {
    return getFirst();
  }
}

const getStoredParam = (connectorId: string, paramId: string) => {
  const key = `immarkus:services:${connectorId}:${paramId}`;
  return localStorage.getItem(key);
}

const setPersistedService = (connectorId: string, index: number) => 
  localStorage.setItem(KEY_SERVICE, `${connectorId}::${index}`);

export const TranslateButton = (props: TranslateButtonProps) => {

  const availableConnectors = useMemo(() => connectors.filter(connector => {
    if (!connector.requiresKey) return true;

    const requiredParams = (connector.parameters || []).filter(param => param.required);
    if (requiredParams.some(param => param.type !== 'credential'))
      return false; // Currently, only persisted credential params are supported

    // Should never happen because `requiresKey` implies a required arg!
    if (requiredParams.length === 0) {
      console.warn(`Possibly misconfigured transcription service: ${connector.id}`);
      return false;
    }

    // We have required credential params - check if they are stored!
    return requiredParams.every(param => getStoredParam(connector.id, param.id));
  }), []);

  const disabled = props.disabled || availableConnectors.length === 0;

  const [selectedService, setSelectedService] =
    useState<TranslationSettings>(getInitialService(availableConnectors));

  const [targetLanguage, setTargetLanguage] = usePersistentState(KEY_LANGUAGE, 'en');

  // Persist changes to locaStorage
  useEffect(() => {
    const { connector, index } = selectedService;
    if (connector)
      setPersistedService(connector.id, index);
  }, [selectedService]);

  const onClickTranslate = () => props.onClickTranslate({
    ...selectedService,
    language: targetLanguage
  });

  return availableConnectors.length > 0 ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn(
            'group h-6 py-3.5 px-2 rounded-full transition-colors flex items-center hover:bg-accent',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}>
          <button
            disabled={disabled}
            type="button"
            className={cn('p-0 pr-1 flex items-center justify-center bg-transparent hover:text-accent-foreground',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
            onClick={onClickTranslate}>
            <Languages className="size-4" />
          </button>

          <TranslateSettingsPopover
            availableConnectors={availableConnectors}
            disabled={disabled} 
            language={targetLanguage}
            selectedService={selectedService}
            onChangeLanguage={setTargetLanguage}
            onChangeService={setSelectedService} />
        </div>
      </TooltipTrigger>

      <TooltipContent>
        Show translation
      </TooltipContent>
    </Tooltip>
  ) : null;

}