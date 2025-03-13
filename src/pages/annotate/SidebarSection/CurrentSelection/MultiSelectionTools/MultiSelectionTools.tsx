import { Button } from '@/ui/Button';
import { ImageAnnotation } from '@annotorious/react';
import { Combine, Subtract } from './Icons';

interface MultiSelectionOptionsProps {

  selected: ImageAnnotation[];

}

export const MultiSelectionTools = (props: MultiSelectionOptionsProps) => {
  
  return (
    <div className="flex gap-2">
      <Button 
        className="flex gap-2">
        <Combine className="size-5" /> Merge
      </Button>

      <Button 
        className="flex gap-2">
        <Subtract className="size-5" /> Subtract
      </Button>
    </div>
  )

}