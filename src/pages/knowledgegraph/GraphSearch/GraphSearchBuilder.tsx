import { useRef, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { Grip, X } from 'lucide-react';
import { Button } from '@/ui/Button';

interface GraphSearchBuilderProps {

  onClose(): void;

}

export const GraphSearchBuilder = (props: GraphSearchBuilderProps) => {

  const el = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  useDraggable(el, {
    position,
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
  });

  return (
    <div 
      ref={el}
      className="bg-white min-w-[510px] min-h-[180px] backdrop-blur-sm border absolute top-6 left-6 rounded shadow-lg z-30">
    
      <div className="flex justify-between items-center pl-2 pr-1 py-1 border-b cursor-move mb-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Grip className="w-4 h-4 mb-0.5" />
          <span>Graph Search</span>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="p-0 h-auto w-auto"
          onClick={props.onClose}>
          <X className="h-8 w-8 p-2" />
        </Button>
      </div>
    </div>
  )

}