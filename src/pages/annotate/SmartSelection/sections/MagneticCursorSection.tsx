import { useEffect } from 'react';
import { Magnet } from 'lucide-react';
import { AnnotationMode, Tool } from '../../AnnotationMode';

interface MagneticCursorSectionProps {

    onChangeMode(mode: AnnotationMode): void;

    onChangeTool(tool: Tool): void;

}

export const MagneticCursorSection = (props: MagneticCursorSectionProps) => {

  useEffect(() => {
    props.onChangeTool('magnetic-cursor');
    props.onChangeMode('draw');
  }, []);

  return (
    <div className="px-4">
      <div className="flex justify-center pt-6 pb-1">
        <div 
          className="!rounded-md aspect-square h-12 text-white bg-orange-400 flex items-center justify-center">
          <Magnet className="size-5.5" strokeWidth={1.5} />
        </div>
      </div>

      <p className="pt-3 pb-2 font-light text-center leading-relaxed">
        Create polygons normally. The mouse cursors automatically snaps to the 
        edges of nearby objects. 
      </p>
    </div>
  )

}