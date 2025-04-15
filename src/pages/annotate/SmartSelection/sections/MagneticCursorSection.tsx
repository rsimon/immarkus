import { Toggle } from '@/ui/Toggle';
import { TriangleRight } from 'lucide-react';

interface MagneticCursorSectionProps {

  enabled: boolean;

  onSetEnabled(enabled: boolean): void;

}

export const MagneticCursorSection = (props: MagneticCursorSectionProps) => {

  return (
    <div className="px-4">
      <div className="flex justify-center pt-6 pb-1">
        <Toggle
          pressed={props.enabled}
          onPressedChange={props.onSetEnabled}
          className="!rounded-md aspect-square h-12 hover:border-orange-400 hover:[&+*]:text-orange-400 border border-orange-500/40 text-orange-400/60 hover:text-orange-400 data-[state=on]:bg-orange-400 data-[state=on]:border-orange-400 data-[state=on]:[&+*]:text-orange-400">
          <TriangleRight className="w-5 h-5 -rotate-[15deg] mr-1" strokeWidth={1.5}/> 
        </Toggle>
      </div>

      <p className="pt-3 pb-2 font-light text-center leading-relaxed">
        Create polygons normally. The mouse cursors automatically snaps to the 
        edges of nearby objects. 
      </p>
    </div>
  )

}