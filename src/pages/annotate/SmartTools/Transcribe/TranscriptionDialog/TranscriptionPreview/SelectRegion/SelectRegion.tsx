import { useEffect, useState } from 'react';
import { SquareDashedMousePointer, X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Toggle } from '@/ui/Toggle';
import { SelectionTool } from './SelectionTool';
import { SelectionMask } from './SelectionMask';
import { ProcessingState, Region } from '../../../Types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';

interface SelectRegionProps {

  processingState?: ProcessingState;

  onChangeRegion(region?: Region): void;

}

export const SelectRegion = (props: SelectRegionProps) => {

  const [pressed, setPressed] = useState(false);

  const [region, setRegion] = useState<Region | undefined>();

  useEffect(() => {
    const isSuccess = props.processingState === 'success' || 
      props.processingState === 'success_empty';

    // Clear the state in case of successful OCR
    if (isSuccess) {
      setPressed(false);
      setRegion(undefined);
      props.onChangeRegion(undefined);
    }
  }, [props.processingState, props.onChangeRegion]);

  const onToggle = (pressed: boolean) => {
    setPressed(pressed);

    if (!pressed) {
      setRegion(undefined);
      
      if (region)
        props.onChangeRegion(undefined);
    }
  }

  const onSelect = (region: Region) => {
    setRegion(region);
    setPressed(false);

    props.onChangeRegion(region);
  }

  const onClearRegion = () => {
    setRegion(undefined);
    setPressed(true);
    props.onChangeRegion(undefined);
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {region ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="absolute text-xs gap-1.5 top-2 left-2 z-10 bg-white shadow-xs px-2.5 py-2 h-auto pointer-events-auto"
              onClick={onClearRegion}>
              <X className="size-4.5" /> Clear Selection
            </Button>
          </TooltipTrigger>
        </Tooltip>
      ) : ( 
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle 
                className="absolute top-2 left-2 z-10 bg-white hover:text-black shadow-xs p-2.5 h-auto pointer-events-auto"
                pressed={pressed}
                onPressedChange={onToggle}>
                <SquareDashedMousePointer className="size-4.5" />
              </Toggle>
            </span>
          </TooltipTrigger>

          <TooltipContent
            collisionPadding={20}>
            Select a region (optional)
          </TooltipContent>
        </Tooltip>
      )}

      {pressed && (
        <SelectionTool onSelect={onSelect} />
      )}

      {region && (
        <SelectionMask {...region} />
      )}
    </div>
  )

}