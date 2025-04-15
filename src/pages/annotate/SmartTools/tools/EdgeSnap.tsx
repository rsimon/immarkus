import { Toggle } from '@/ui/Toggle';
import { Magnet } from 'lucide-react';

interface EdgeSnapProps {

  enabled: boolean;

  onSetEnabled(enabled: boolean): void;

}

export const EdgeSnap = (props: EdgeSnapProps) => {

  return (
    <div className="px-4">
      <div className="pt-6 pb-1 flex gap-3 items-center">
        <div className="flex justify-center">
          <Toggle
            pressed={props.enabled}
            onPressedChange={props.onSetEnabled}
            className="!rounded-md aspect-square h-12 hover:border-orange-400 hover:[&+*]:text-orange-400 border border-orange-500/40 text-orange-400/60 hover:text-orange-400 data-[state=on]:bg-orange-400 data-[state=on]:border-orange-400 data-[state=on]:[&+*]:text-orange-400">
            <Magnet className="size-6" strokeWidth={1.5}/> 
          </Toggle>
        </div>

        <p className="font-medium">
          Snaps your cursor to nearby edges for precise tracing.
        </p>
      </div>

      <p className="pt-3 pb-2 font-light leading-relaxed">
        Use this tool for tracing along clear lines and corners—especially 
        in high-contrast images.
      </p>
    </div>
  )

}