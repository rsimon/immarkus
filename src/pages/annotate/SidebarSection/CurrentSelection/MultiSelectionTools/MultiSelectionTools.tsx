import { Button } from '@/ui/Button';
import { ImageAnnotation } from '@annotorious/react';
import { useBooleanPlugin } from '../../../PluginProvider';
import { Combine, Subtract } from './Icons';

interface MultiSelectionOptionsProps {

  selected: ImageAnnotation[];

}

export const MultiSelectionTools = (props: MultiSelectionOptionsProps) => {

  const plugin = useBooleanPlugin();
  
  return (
    <div className="p-2 flex flex-col gap-12">
      <div className="flex flex-col">
        <Button 
          className="flex gap-2"
          variant="outline"
          onClick={() => plugin.mergeSelected()}>
          <Combine className="size-5" /> Merge selected shapes
        </Button>

        <p className="py-4 px-0.5 leading-relaxed text-muted-foreground text-xs">
          Combine selected shapes into a single union. Only data associated with 
          the first selected shape is preserved. Data from other selections 
          will be lost.
        </p>
      </div>

      <div className="flex flex-col">
        <Button 
          className="flex gap-2"
          variant="outline"
          onClick={() => plugin.subtractSelected()}>
          <Subtract className="size-5" /> Subtract
        </Button>

        <p className="py-4 px-0.5 leading-relaxed text-muted-foreground text-xs">
          Remove the area of the second shape from the first shape. Data 
          from the first selected shape is preserved. The second shape will
          be deleted.
        </p>
      </div>
    </div>
  )

}