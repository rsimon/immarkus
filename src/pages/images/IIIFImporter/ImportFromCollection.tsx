import { useMemo, useState } from 'react';
import { Cozy, CozyCollection, CozyCollectionItem, CozyParseResult } from 'cozy-iiif';
import { useStore } from '@/store';
import { generateShortId } from '@/store/utils';
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
import { Spinner } from '@/components/Spinner';

interface ImportFromCollectionProps {

  open: boolean;

  collection?: CozyCollection;

  onCancel(): void;

}

export const ImportFromCollection = (props: ImportFromCollectionProps) => {

  const store = useStore();

  const [selected, setSelected] = useState<CozyCollectionItem[]>([]);

  const [parsed, setParsed] = useState<CozyParseResult[]>([]);

  const [importing, setImporting] = useState(false);
  
  const [importError, setImportError] = useState<string | undefined>();

  const importProgress = useMemo(() => {
    if (!importing || selected.length === 0) return 0;
    return parsed.length / selected.length;
  }, [importing, selected, parsed]);

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

  const onImport = () => {
    // Should never happen
    if (selected.length === 0) return;

    setImporting(true);

    const importOne = (manifest: CozyCollectionItem) =>
      generateShortId(manifest.id).then(id => {
        const exists = Boolean(store.getIIIFResource(id));
        if (exists) {
          return Promise.reject(`${manifest.getLabel()} already exists in your project.`);
        } else {
          return Cozy.parseURL(manifest.id);
        }
      });

    selected.reduce<Promise<CozyParseResult[]>>((promise, manifest) => promise.then(results => {
      return importOne(manifest).then(parsed => {
        const next = [...results, parsed];
        setParsed(next);
        return next;
      });
    }), Promise.resolve([])).then(results => {
      setImporting(true);
      console.log('resolved all', results);
    }).catch(error => {
      console.error(error);

      setImporting(true);
      setImportError(error.message);
    });
  }

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
            onClick={onImport}
            className="min-w-32"
            disabled={importing || selected.length === 0}>
            {importing ? (
              <Spinner className="size-4" />
            ) : (
              <span>Import ({selected.length})</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>    
  )

}