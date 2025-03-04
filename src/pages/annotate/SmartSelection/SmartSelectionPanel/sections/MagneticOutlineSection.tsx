import { MousePointerClick } from 'lucide-react';

interface MagneticOutlinePanelProps {

}

export const MagneticOutlineSection = (props: MagneticOutlinePanelProps) => {

  return (
    <div>
      <div className="flex justify-center pt-6 pb-1">
        <div 
          className="size-10 flex items-center justify-center rounded-full aspect-square text-white bg-primary">
          <MousePointerClick className="size-5" />
        </div>
      </div>

      <p className="pt-3 px-4 text-muted-foreground leading-relaxed font-light text-center">
        Click to place points along the edge of an object. The outline will snap to detected contours.
      </p>
    </div>
  )

}