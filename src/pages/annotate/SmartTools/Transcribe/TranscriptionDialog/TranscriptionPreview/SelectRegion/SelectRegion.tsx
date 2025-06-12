import { Toggle } from '@/ui/Toggle';
import { SquareDashedMousePointer } from 'lucide-react';
import { useState } from 'react';
import { SelectionTool } from './SelectionTool';
import { SelectionMask } from './SelectionMask';

interface SelectRegionProps {

}

export const SelectRegion = (props: SelectRegionProps) => {

  const [pressed, setPressed] = useState(false);

  const [selection, setSelection] = useState<{ x: number, y: number, w: number, h: number }>();

  const onToggle = (pressed: boolean) => {
    setPressed(pressed);
    setSelection(undefined);
  }

  const onSelect = (x: number, y: number, w: number, h: number) => {
    setSelection({ x, y, w, h });
    setPressed(false);
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

      {selection && (
        <SelectionMask {...selection} />
      )}
    </div>
  )

}