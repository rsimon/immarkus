import { Toggle } from '@/ui/Toggle';
import { Scissors } from 'lucide-react';

interface SmartScissorsSectionProps {

  enabled: boolean;

  onSetEnabled(enabled: boolean): void;

}

export const SmartScissorsSection = (props: SmartScissorsSectionProps) => {

  return (
    <div className="px-4">
      <div className="flex justify-center pt-6 pb-1">
        <Toggle
          pressed={props.enabled}
          onPressedChange={props.onSetEnabled}
          className="!rounded-md aspect-square h-12 hover:border-orange-400 hover:[&+*]:text-orange-400 border border-orange-500/40 text-orange-400/60 hover:text-orange-400 data-[state=on]:bg-orange-400 data-[state=on]:border-orange-400 data-[state=on]:[&+*]:text-orange-400">
          <Scissors className="size-5.5" strokeWidth={1.5} />
        </Toggle>
      </div>

      <p className="pt-3 pb-2 font-light text-center leading-relaxed">
        Click and move the mouse. The path automatically traces the
        outline of nearby objects. Click to add a corner.
      </p>
    </div>
  )

}