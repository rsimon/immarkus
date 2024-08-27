import { useMemo, useState } from 'react';
import { Spline } from 'lucide-react';
import { useSelection } from '@annotorious/react-manifold';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { Skeleton } from '@/ui/Skeleton';
import { ToolbarButton } from '../../ToolbarButton';
import { RelationEditorHint } from './RelationEditorHint';
import { ImageAnnotation } from '@annotorious/react';

export const RelationEditor = () => {

  const [open, setOpen] = useState(false);

  const selection = useSelection();
  
  const source: ImageAnnotation = useMemo(() => {
    const first = selection.selected[0];
    return first ? first.annotation as ImageAnnotation : undefined;
  }, [selection]);

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div>
          <ToolbarButton
            disabled={selection.selected.length === 0}
            onClick={() => setOpen(open => !open)}>
            <Spline
              className="h-8 w-8 p-2" />
          </ToolbarButton>
        </div>
      </PopoverTrigger>

      <PopoverContent 
        className="w-fit"
        align="end" 
        side="bottom" 
        sideOffset={14}>
        <RelationEditorHint source={source} />
      </PopoverContent>
    </Popover>
  )

}