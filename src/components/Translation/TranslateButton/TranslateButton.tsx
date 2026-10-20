import { useEffect, useMemo, useState } from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { cn } from '@/ui/utils';
import { usePersistentState } from '@/utils/usePersistentState';
import { TranslateSettingsPopover } from './TranslateSettingsPopover';
import { TranslationSettings } from './Types';
import {
  getAvailableTranslationConnectors,
  getPersistedTranslationService,
  isTranslationServiceConfigured,
  persistTranslationService,
  TRANSLATION_LANGUAGE_KEY
} from '../translationSettings';

interface TranslateButtonProps {

  disabled?: boolean; 

  onClickTranslate(settings: TranslationSettings): void;

}

const connectors = getAvailableTranslationConnectors();

export const TranslateButton = (props: TranslateButtonProps) => {
  const { t } = useTranslation('common');

  const [selectedService, setSelectedService] = useState<TranslationSettings | undefined>(
    () => getPersistedTranslationService(connectors));

  const [targetLanguage, setTargetLanguage] = usePersistentState(TRANSLATION_LANGUAGE_KEY, 'en');

  const disabled = props.disabled || !selectedService
    || !isTranslationServiceConfigured(selectedService.connector);

  useEffect(() => {
    if (selectedService)
      persistTranslationService(selectedService);
  }, [selectedService]);

  const onClickTranslate = () => {
    if (!disabled && selectedService)
      props.onClickTranslate({ ...selectedService, language: targetLanguage });
  }

  const availableConnectors = useMemo(() => 
    connectors.filter(isTranslationServiceConfigured), [connectors]);

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
        {t('translation.showTranslation')}
      </TooltipContent>
    </Tooltip>
  ) : null;

}