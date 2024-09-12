import { useEffect, useRef, useState } from 'react';
import { Spline } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ImageAnnotation } from '@annotorious/react';
import { useAnnotoriousManifold, useSelection } from '@annotorious/react-manifold';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { useStore } from '@/store';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/Popover';
import { ToolbarButton } from '../../ToolbarButton';
import { RelationEditorContent } from './RelationEditorContent';

export const RelationEditor = () => {

  const store = useStore();

  const manifold = useAnnotoriousManifold();

  const { relationshipTypes } = store.getDataModel();

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
  const disabled = !open &&
    (selection.selected.length === 0 || relationshipTypes.length === 0);

  useEffect(() => {
    // When the editor opens, keep the current selection as source
    if (open)
      setSource(lastSelected.current);
    else
      setSource(undefined);
  }, [open]);

  const onSave = (from: ImageAnnotation, to: ImageAnnotation, relation: string) => {
    const fromImageId = manifold.findSource(from.id);
    const toImageId = manifold.findSource(to.id);

    const imageId = fromImageId === toImageId ? fromImageId : undefined;

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

    // TODO button busy state

    store.upsertRelation(link, meta, imageId).then(() => {
      setSource(undefined);
      setOpen(false);  
    });
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
            relationshipTypes={relationshipTypes}
            source={source} 
            onSave={onSave} 
            onCancel={() => setOpen(false)} />
        )}
      </PopoverContent>
    </Popover>
  )

}