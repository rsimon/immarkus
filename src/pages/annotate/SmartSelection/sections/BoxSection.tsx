import { SquareMousePointer } from 'lucide-react';

interface BoxPanelProps {

}

export const BoxSection = (props: BoxPanelProps) => {

  return (
    <div className="px-4">
      <p className="pt-3 pb-2 font-light leading-relaxed">
        <span className="font-semibold">Coming soon!</span> Draw an approximate box around the object.
      </p>

      <div className="flex justify-center pt-6 pb-4">
        <div 
          className="!rounded-md aspect-square h-12 border border-orange-500/25 text-orange-400/25 flex items-center justify-center">
          <SquareMousePointer className="size-5"/>
        </div>
      </div>
    </div>
  )

}