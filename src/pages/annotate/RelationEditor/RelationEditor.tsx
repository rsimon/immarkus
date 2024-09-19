import { useEffect, useRef, useState } from 'react';
import { Spline } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { useStore } from '@/store';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { ToolbarButton } from '../ToolbarButton';
import { RelationEditorContent } from './RelationEditorContent';
import { useSavingState } from '../SavingState';
import { useRelationEditor } from './RelationEditorRoot';

interface RelationEditorProps {

  onOpenChange(open: boolean): void;

}

export const RelationEditor = (props: RelationEditorProps) => {

  const store = useStore();

  const { setSavingState } = useSavingState();

  const [open, setOpen] = useState(false);

  const onCancel = () => {
    setOpen(false);
    props.onOpenChange(false);
  }

  const { source, setSource, target, setTarget } = useRelationEditor({ onCancel });

  const selection = useSelection();

  const lastSelected = useRef<ImageAnnotation>();

  useEffect(() => {
    if ((selection?.selected || []).length > 0) {
      const last = selection.selected[0];
      lastSelected.current = last.annotation as ImageAnnotation;
    }
  }, [selection]);

  // Don't enable if there is no selection, or no relationship types
  const disabled = !open && selection.selected.length === 0;

  useEffect(() => {
    // When the editor opens, keep the current selection as source
    if (open) {
      setSource(lastSelected.current);
    } else {
      setSource(undefined);
      setTarget(undefined)
    }
    
    props.onOpenChange(open);
  }, [open]);

  const onSave = (from: ImageAnnotation, to: ImageAnnotation, relation: string) => {
    const id = uuidv4();

    const link: W3CRelationLinkAnnotation = {
      id,
      motivation: 'linking',
      body: to.id,
      target: from.id
    };

    const meta: W3CRelationMetaAnnotation = {
      id: uuidv4(),
      motivation: 'tagging',
      body: {
        value: relation
      },
      target: id
    };

    setSavingState({ value: 'saving' });

    store.upsertRelation(link, meta).then(() => {
      setSource(undefined);
      setOpen(false);  
      setSavingState({ value: 'success' });
    }).catch(error => {
      console.error(error);
      setSavingState({ value: 'failed' });
    })
  }

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <div>
          <ToolbarButton
            className="flex items-center pr-2"
            disabled={disabled}
            onClick={() => setOpen(open => !open)}>
            <Spline
              className="h-8 w-8 p-2" /> Relation
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
            source={source} 
            target={target}
            onSave={onSave} 
            onCancel={() => setOpen(false)} />
        )}
      </PopoverContent>
    </Popover>
  )

}