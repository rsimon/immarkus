import { useEffect, useState } from 'react'; 
import { FolderCheck, FolderSync, FolderX } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';
import { useSavingState } from './useSavingState';

interface SavingStateIndicatorProps {

  fadeOut?: number;

}

export const SavingStateIndicator = (props: SavingStateIndicatorProps) => {

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
    <div className="saving-state-indicator">
      {savingState.value === 'idle' ? (
        <Popover>
          <PopoverTrigger 
            className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 items-center">
            <FolderCheck className="h-4 w-4" />
          </PopoverTrigger>

          <PopoverContent 
            align="center"
            className="text-xs flex gap-2 font-medium w-[200px] items-center 
            justify-center text-green-600">
            <FolderCheck className="h-4 w-4" />All annotations saved
          </PopoverContent>
        </Popover>
      ) : savingState.value === 'success' ? (
        <Popover>
          <PopoverTrigger 
            className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 items-center">
            <FolderCheck className="h-4 w-4" />
            <span style={{ opacity, width: opacity === 0 ? 0 : undefined}}>
              <span className="ml-1">Saved</span>
            </span>
          </PopoverTrigger>

          <PopoverContent 
            align="center"
            className="text-xs flex gap-2 font-medium w-[200px] items-center 
            justify-center text-green-600">
            <FolderCheck className="h-4 w-4" />All annotations saved
          </PopoverContent>
        </Popover>
      ) : savingState.value === 'failed' ? (
        <Popover>
          <PopoverTrigger
            className="p-2 flex gap-1 text-xs font-medium rounded-md hover:bg-muted focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 items-center text-red-600">
            <FolderX size={16} />
            <span>Failed</span>
          </PopoverTrigger> 

          <PopoverContent 
            align="start"
            alignOffset={-18}
            className="text-xs flex gap-2 font-medium w-[200px] items-center 
            justify-center text-red-600">
            <FolderX className="h-4 w-4" />{savingState.message || 'Error saving data'}
          </PopoverContent>
        </Popover>
      ) : savingState.value === 'saving' ? (
        <button 
          className="p-2 flex text-xs rounded-md hover:bg-muted focus-visible:outline-none 
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 items-center">
          <FolderSync size={16} />
          <span className="ml-1">Saving</span>
        </button>
      ) : null}
    </div>
  )

}