import { useState } from 'react';
import { CozyCollection, CozyCollectionItem } from 'cozy-iiif';
import { Button } from '@/ui/Button';
import { Checkbox } from '@/ui/Checkbox';
import { Separator } from '@/ui/Separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogTitle
} from '@/ui/Dialog';

interface ImportFromCollectionProps {

  open: boolean;

  collection?: CozyCollection;

  onCancel(): void;

  onImport(manifests: string[]): void;

}

export const ImportFromCollection = (props: ImportFromCollectionProps) => {

  const [selected, setSelected] = useState<CozyCollectionItem[]>([]);

  const onToggleItem = (item: CozyCollectionItem, checked: boolean) => {
    if (checked) {
      setSelected(prev => [...prev, item]);
    } else {
      setSelected(prev => prev.filter(selectedItem => selectedItem.id !== item.id));
    }
  }

  const onSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected([...props.collection.items]);
    } else {
      setSelected([]);
    }
  }

  const isItemSelected = (item: CozyCollectionItem) =>
    selected.some(selectedItem => selectedItem.id === item.id);

  const isAllSelected = selected.length === (props.collection?.items || []).length;

  const isIndeterminate = selected.length > 0 && selected.length < (props.collection?.items || []).length;

  return (
    <Dialog open={props.open}>
      <DialogContent>
        <DialogTitle>
          Import from IIIF Collection
        </DialogTitle>
        <DialogDescription className="leading-relaxed">
          This collection contains multiple presentation manifests. Choose 
          which items to import into your workspace.
        </DialogDescription>

        <div className="mt-4 mb-4 overflow-hidden">
          <div className="flex gap-2 items-center font-light">
            <Checkbox 
              checked={isIndeterminate ? 'indeterminate' : isAllSelected}
              onCheckedChange={onSelectAll} />
            <span className="text-xs">
              Select All
            </span>
          </div>

          <Separator className="mt-2.5 mb-3"/>

          <ul className="text-sm space-y-3">
            {props.collection?.items.map(manifest => (
              <li 
                key={manifest.id}
                className="flex gap-2 items-center overflow-hidden">
                <Checkbox 
                  checked={isItemSelected(manifest)}
                  onCheckedChange={checked => onToggleItem(manifest, checked as boolean)} /> 
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {manifest.getLabel()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex">
          <Button 
            variant="ghost" 
            onClick={props.onCancel}>
            Cancel
          </Button>

          <Button 
            onClick={() => props.onImport?.(selected.map(m => m.id))}
            disabled={selected.length === 0}>
            Import ({selected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>    
  )

}