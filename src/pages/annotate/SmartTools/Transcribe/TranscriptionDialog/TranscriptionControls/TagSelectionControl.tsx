import { useState } from 'react';
import { EntityType } from '@/model';
import { X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { EntityTypeBrowserDialog } from '@/components/EntityTypeBrowser';

interface TagSelectionControlProps {

  selectedTags: EntityType[];

  onChangeSelectedTags(tags: EntityType[]): void;

}

export const TagSelectionControl = (props: TagSelectionControlProps) => {
  const [showDialog, setShowDialog] = useState(false);

  const onAdd = (toAdd: EntityType) => {
    setShowDialog(false);

    if (props.selectedTags.every(t => t.id !== toAdd.id))
      props.onChangeSelectedTags([...props.selectedTags, toAdd]);
  }

  const onRemove = (toRemove: EntityType) => {
    if (props.selectedTags.some(t => t.id === toRemove.id))
      props.onChangeSelectedTags(props.selectedTags.filter(t => t !== toRemove));
  }

  return (
    <div className="space-y-2">
      <ul
        role="list" 
        aria-label="Selected entity classes"
        className="border rounded-md bg-muted shadow-xs p-1 flex flex-wrap items-center gap-1 gap-y-0.5">
        {props.selectedTags.map(t => (
          <li 
            key={t.id}
            className="bg-white/90 whitespace-nowrap rounded-full inline-flex items-center text-[11px] gap-1 px-1.5 py-0.5 border">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
              style={{ backgroundColor: t.color }}/>
            <span>{t.label || t.id}</span>
            <button 
              type="button" 
              aria-label={`Remove ${t.label || t.id}`}
              onClick={() => onRemove(t)}
              className="">
              <X className="size-3 text-muted-foreground" />
            </button>
          </li>
        ))}

        <li 
          className="inline-flex ml-1 grow" 
          role="presentation">
          <Button 
            variant="ghost"
            onClick={() => setShowDialog(true)}
            className="h-auto grow px-0 py-1 text-muted-foreground font-light text-xs justify-start">
            {props.selectedTags.length === 0 ? (
              <span>Select tags...</span>
            ) : (
              <span>Add tag...</span>
            )}
          </Button>
        </li>
      </ul>  

      <div className="flex justify-end px-1">
        {props.selectedTags.length > 0 && (
          <Button
            variant="link"
            className="underline font-normal text-muted-foreground hover:text-foreground p-0 h-auto text-[11px]"
            onClick={() => props.onChangeSelectedTags([])}>
            Clear
          </Button>
        )}
      </div>

      <EntityTypeBrowserDialog 
        open={showDialog} 
        onCancel={() => setShowDialog(false)} 
        onAddEntityType={onAdd} />
    </div>
  )

}