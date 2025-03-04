import { SquareMousePointer } from 'lucide-react';

interface BoxPanelProps {

}

export const BoxSection = (props: BoxPanelProps) => {

  return (
    <div>
      <div className="flex justify-center pt-6 pb-1">
        <div 
          className="size-10 flex items-center justify-center rounded-full aspect-square text-white bg-primary">
          <SquareMousePointer className="size-5"/>
        </div>
      </div>

      <p className="pt-3 px-4 text-muted-foreground font-light leading-relaxed text-center">
        Draw an approximate box around the object.
      </p>
    </div>
  )

}