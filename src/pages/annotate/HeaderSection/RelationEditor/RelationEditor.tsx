import { useMemo, useState } from 'react';
import { Spline } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { useDataModel } from '@/store';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { ToolbarButton } from '../../ToolbarButton';
import { RelationEditorContent } from './RelationEditorContent';

export const RelationEditor = () => {

  const { relationshipTypes } = useDataModel();

  const [open, setOpen] = useState(false);

  const selection = useSelection();
  
  const source: ImageAnnotation = useMemo(() => {
    const first = selection.selected[0];
    return first ? first.annotation as ImageAnnotation : undefined;
  }, [selection]);

  // Don't enable if there is no selection, or no relationship types
  const disabled = selection.selected.length === 0 || relationshipTypes.length === 0;

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div>
          <ToolbarButton
            disabled={disabled}
            onClick={() => setOpen(open => !open)}>
            <Spline
              className="h-8 w-8 p-2" />
          </ToolbarButton>
        </div>
      </PopoverTrigger>

      <PopoverContent 
        className="w-72"
        align="start" 
        side="bottom" 
        sideOffset={14}>
        <RelationEditorContent 
          source={source} />
      </PopoverContent>
    </Popover>
  )

}