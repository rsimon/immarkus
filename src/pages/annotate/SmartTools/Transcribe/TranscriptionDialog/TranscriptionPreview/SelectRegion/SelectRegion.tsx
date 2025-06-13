import { useState } from 'react';
import { SquareDashedMousePointer } from 'lucide-react';
import { Toggle } from '@/ui/Toggle';
import { SelectionTool } from './SelectionTool';
import { SelectionMask } from './SelectionMask';
import { Region } from '../../../Types';

interface SelectRegionProps {

  onChangeRegion(region?: Region): void;

}

export const SelectRegion = (props: SelectRegionProps) => {

  const [pressed, setPressed] = useState(false);

  const [region, setRegion] = useState<Region | undefined>();

  const onToggle = (pressed: boolean) => {
    setPressed(pressed);
    setRegion(undefined);
  }

  const onSelect = (region: Region) => {
    setRegion(region);
    setPressed(false);

    props.onChangeRegion(region);
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <Toggle 
        className="absolute top-2 left-2 z-10 bg-white hover:text-black shadow-xs p-2.5 h-auto pointer-events-auto"
        pressed={pressed}
        onPressedChange={onToggle}>
        <SquareDashedMousePointer className="size-4.5" />
      </Toggle>

      {pressed && (
        <SelectionTool onSelect={onSelect} />
      )}

      {region && (
        <SelectionMask {...region} />
      )}
    </div>
  )

}