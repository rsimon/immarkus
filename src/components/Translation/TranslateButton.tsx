import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Languages } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { ServiceConnectorConfig, ServiceRegistry } from '@/services';
import { cn } from '@/ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/ui/Select';

const connectors = ServiceRegistry.listAvailableConnectors('TRANSLATION');

interface TranslateButtonProps {

  onClickTranslate(connector: ServiceConnectorConfig): void;

}

const getStoredParam = (connectorId: string, paramId: string) => {
  const key = `immarkus:services:${connectorId}:${paramId}`;
  return localStorage.getItem(key);
}

const KEY = 'immarkus:annotate:translation-connector';

const getInitialConnector = (available: ServiceConnectorConfig[]) => {
  const persistedId = localStorage.getItem(KEY);
  if (!persistedId) return available[0];

  return available.find(c => c.id === persistedId) || available[0];
}

const setPersisted = (connectorId: string) => localStorage.setItem(KEY, connectorId);

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

  const disabled = availableConnectors.length === 0;

  const [selectedConnector, setSelectedConnector] = useState<ServiceConnectorConfig>(
    getInitialConnector(availableConnectors));

  // Persist changes to locaStorage
  useEffect(() => setPersisted(selectedConnector.id), [selectedConnector]);

  const onChangeConnector = (connectorId: string) =>
    setSelectedConnector(availableConnectors.find(c => c.id === connectorId));

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
            onClick={() => props.onClickTranslate(selectedConnector)}>
            <Languages className="size-4" />
          </button>

          <Select 
            value={selectedConnector?.id}
            onValueChange={onChangeConnector}>
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
                <SelectItem 
                  key={connector.id} 
                  value={connector.id}>
                  {connector.displayName}
                </SelectItem>
              ))}
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