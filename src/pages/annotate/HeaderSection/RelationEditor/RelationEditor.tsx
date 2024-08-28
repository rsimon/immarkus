import { useEffect, useRef, useState } from 'react';
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

  const lastSelected = useRef<ImageAnnotation>();

  const [source, setSource] = useState<ImageAnnotation | undefined>(); 

  useEffect(() => {
    const last = selection.selected[0];
    if (last)
      lastSelected.current = last.annotation as ImageAnnotation;
  }, [selection]);

  // Don't enable if there is no selection, or no relationship types
  const disabled = selection.selected.length === 0 || relationshipTypes.length === 0;

  useEffect(() => {
    // When the editor opens, keep the current selection as source
    if (open)
      setSource(lastSelected.current);
    else
      setSource(undefined);
  }, [open]);

  const onSave = (source: ImageAnnotation, target: ImageAnnotation, relation: string) => {
    // TODO
  }

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
        {source && (
          <RelationEditorContent 
            relationshipTypes={relationshipTypes}
            source={source} 
            onSave={onSave} />
        )}
      </PopoverContent>
    </Popover>
  )

}