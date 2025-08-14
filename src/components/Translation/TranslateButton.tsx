import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Languages } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { ServiceConnectorConfig, ServiceRegistry, TranslationServiceConfig } from '@/services';
import { cn } from '@/ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/ui/Select';

interface TranslateButtonProps {

  disabled?: boolean; 

  onClickTranslate(connector: ServiceConnectorConfig, service: TranslationServiceConfig): void;

}

interface ServiceSelectionConfig { 
  
  connector: ServiceConnectorConfig;
  
  service: TranslationServiceConfig;

  index: number;

};

const connectors = ServiceRegistry.listAvailableConnectors('TRANSLATION');

const getStoredParam = (connectorId: string, paramId: string) => {
  const key = `immarkus:services:${connectorId}:${paramId}`;
  return localStorage.getItem(key);
}

const KEY = 'immarkus:annotate:translation-connector';

const getInitialService = (available: ServiceConnectorConfig[]): ServiceSelectionConfig => {
  const getFirst = () => {
    const connector = available[0];
    const service = available[0].services.find(s => s.type === 'TRANSLATION');
    return { connector, service, index: 0 };
  }

  const persistedId = localStorage.getItem(KEY);
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

const setPersisted = (connectorId: string, index: number) => 
  localStorage.setItem(KEY, `${connectorId}::${index}`);

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
    useState<ServiceSelectionConfig>(getInitialService(availableConnectors));

  // Persist changes to locaStorage
  useEffect(() => {
    const { connector, index } = selectedService;
    setPersisted(connector.id, index);
  }, [selectedService]);

  const onChangService = (value: string) => {    
    try {
      const [connectorId, indexStr] = value.split('::');
      const index = parseInt(indexStr);

      const connector = availableConnectors.find(c => c.id === connectorId);
      const service = connector.services.filter(s => s.type === 'TRANSLATION')[index];
      setSelectedService({ connector, service, index });
    } catch {
      // Should never happen
      console.error('Error parsing service ID', value);
    }
  }

  const onClickTranslate = () =>
    props.onClickTranslate(selectedService.connector, selectedService.service);

  return (
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

          <Select 
            value={`${selectedService.connector.id}::${selectedService.index}`}
            onValueChange={onChangService}>
            <SelectTrigger 
              asChild
              disabled={disabled}>
              <button
                type="button"
                className={cn('flex items-center justify-center p-0 bg-transparent hover:text-accent-foreground outline-0', 
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
                <ChevronDown className="size-3.5" />
              </button>
            </SelectTrigger>

            <SelectContent>
              {availableConnectors.map(connector => (
                connector.services.filter(s => s.type === 'TRANSLATION')).map((service, idx) => (
                  <SelectItem 
                    key={`${connector.id}::${idx}`} 
                    value={`${connector.id}::${idx}`}>
                    {service.displayName || connector.displayName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </TooltipTrigger>

      <TooltipContent>
        Show translation
      </TooltipContent>
    </Tooltip>
  )

}