import { MousePointerClick } from 'lucide-react';

interface MagneticOutlinePanelProps {

}

export const MagneticOutlineSection = (props: MagneticOutlinePanelProps) => {

  return (
    <div className="px-4">
      <p className="pt-3 pb-2 font-light leading-relaxed">
        <span className="font-semibold">Coming soon!</span> Click to add points along the edge of an object. 
        The outline snaps to the contour.
      </p>

      <div className="flex justify-center pt-5 pb-4">
        <div 
          className="!rounded-md aspect-square h-12 border border-orange-500/25 text-orange-400/25 flex items-center justify-center">
          <MousePointerClick className="size-5"/>
        </div>
      </div>
    </div>
  )

}