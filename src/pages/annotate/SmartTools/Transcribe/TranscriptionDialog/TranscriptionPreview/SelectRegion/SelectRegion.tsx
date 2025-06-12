import { Toggle } from '@/ui/Toggle';
import { SquareDashedMousePointer } from 'lucide-react';
import { useState } from 'react';
import { SelectionTool } from './SelectionTool';

interface SelectRegionProps {

}

export const SelectRegion = (props: SelectRegionProps) => {

  const [pressed, setPressed] = useState(false);

  return (
    <div>
      <Toggle 
        className="absolute top-2 left-2 z-10 bg-white hover:text-black shadow-xs p-2.5 h-auto"
        pressed={pressed}
        onPressedChange={setPressed}>
        <SquareDashedMousePointer className="size-4.5" />
      </Toggle>

      {pressed && (
        <SelectionTool />
      )}
    </div>
  )

}