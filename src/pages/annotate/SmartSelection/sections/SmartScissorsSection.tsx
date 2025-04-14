import { useEffect } from 'react';
import { Scissors } from 'lucide-react';
import { AnnotationMode, Tool } from '../../AnnotationMode';


interface SmartScissorsSectionProps {

    onChangeMode(mode: AnnotationMode): void;

    onChangeTool(tool: Tool): void;

}

export const SmartScissorsSection = (props: SmartScissorsSectionProps) => {

  useEffect(() => {
    props.onChangeTool('intelligent-scissors');
    props.onChangeMode('draw');
  }, []);

  return (
    <div className="px-4">
      <div className="flex justify-center pt-6 pb-1">
        <div 
          className="!rounded-md aspect-square h-12 text-white bg-orange-400 flex items-center justify-center">
          <Scissors className="size-5.5" strokeWidth={1.5} />
        </div>
      </div>

      <p className="pt-3 pb-2 font-light text-center leading-relaxed">
        Click and move the mouse. The path automatically traces the
        outline of nearby objects. Click to add a corner.
      </p>
    </div>
  )

}