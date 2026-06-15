import { useEffect, useState } from 'react';
import { FolderCheck, FolderSync, FolderX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSavingState } from './useSavingState';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';

interface SavingStateIndicatorProps {

  fadeOut?: number;

}

export const SavingStateIndicator = (props: SavingStateIndicatorProps) => {

  const { t } = useTranslation('annotate');

  const { savingState } = useSavingState();

  const fadeOut = props.fadeOut || 1500;

  const [opacity, setOpacity] = useState(1);

  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!fadeOut)
      return;

    if (timer)
      clearTimeout(timer);

    if (savingState.value === 'success')
      setTimer(setTimeout(() => setOpacity(0), fadeOut));
    else
      setOpacity(1);
  }, [savingState]);

  return (
    <div className="saving-state-indicator ml-1 shrink-0">
      {savingState.value === 'idle' ? (
        <Popover>
          <PopoverTrigger 
            className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-hidden 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 items-center">
            <FolderCheck className="h-4 w-4" />
          </PopoverTrigger>

          <PopoverContent 
            align="center"
            className="text-xs flex gap-2 font-medium w-auto items-center px-3.5 py-2.5
            justify-center text-green-600">
            <FolderCheck className="h-4 w-4" />{t('savingState.allSaved')}
          </PopoverContent>
        </Popover>
      ) : savingState.value === 'success' ? (
        <Popover>
          <PopoverTrigger 
            className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-hidden 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 items-center">
            <FolderCheck className="h-4 w-4" />
            <span style={{ opacity, width: opacity === 0 ? 0 : undefined}}>
              <span className="ml-1">{t('savingState.saved')}</span>
            </span>
          </PopoverTrigger>

          <PopoverContent 
            align="center"
            className="text-xs flex gap-2 font-medium w-[200px] items-center 
            justify-center text-green-600">
            <FolderCheck className="h-4 w-4" />{t('savingState.allSaved')}
          </PopoverContent>
        </Popover>
      ) : savingState.value === 'failed' ? (
        <Popover>
          <PopoverTrigger
            className="p-2 flex gap-1 text-xs font-medium rounded-md hover:bg-muted focus-visible:outline-hidden 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 items-center text-red-600">
            <FolderX size={16} />
            <span>{t('savingState.failed')}</span>
          </PopoverTrigger> 

          <PopoverContent 
            align="start"
            alignOffset={-18}
            className="text-xs flex gap-2 font-medium w-[200px] items-center 
            justify-center text-red-600">
            <FolderX className="h-4 w-4" />{savingState.message || t('savingState.errorSaving')}
          </PopoverContent>
        </Popover>
      ) : savingState.value === 'saving' ? (
        <button 
          className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-hidden 
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 items-center">
          <FolderSync size={16} />
          <span className="ml-1">{t('savingState.saving')}</span>
        </button>
      ) : null}
    </div>
  )

}