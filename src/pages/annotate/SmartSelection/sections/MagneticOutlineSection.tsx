import { useEffect } from 'react';
import { MousePointerClick } from 'lucide-react';
import { AnnotationMode, Tool } from '../../AnnotationMode';

interface MagneticOutlinePanelProps {

    onChangeMode(mode: AnnotationMode): void;

    onChangeTool(tool: Tool): void;

}

export const MagneticOutlineSection = (props: MagneticOutlinePanelProps) => {

  useEffect(() => {
    props.onChangeTool('magnetic-outline');
    props.onChangeMode('draw');

    return () => {
      props.onChangeMode('move');
    }
  }, []);

  return (
    <div className="px-4">
      <p className="pt-3 pb-2 font-light leading-relaxed">
        <span className="font-semibold">Coming soon!</span> Click to add points along the edge of an object. 
        The outline snaps to the contour.
      </p>

      <div className="flex justify-center pt-5 pb-4">
        <div 
          className="!rounded-md aspect-square h-12 text-white bg-orange-400 flex items-center justify-center">
          <MousePointerClick className="size-5"/>
        </div>
      </div>
    </div>
  )

}