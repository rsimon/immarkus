import { useMemo, useState } from 'react';
import murmur from 'murmurhash';
import { LibrarySquare } from 'lucide-react';
import { Cozy, CozyCollection, CozyCollectionItem, CozyParseResult } from 'cozy-iiif';
import { ProgressDialog } from '@/components/ProgressDialog';
import { Spinner } from '@/components/Spinner';
import { IIIFResourceInformation } from '@/model';
import { useStore } from '@/store';
import { generateShortId } from '@/store/utils';
import { Button } from '@/ui/Button';
import { Checkbox } from '@/ui/Checkbox';
import { Separator } from '@/ui/Separator';
import { getCanvasLabelWithFallback } from '@/utils/iiif';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogTitle
} from '@/ui/Dialog';

interface ImportFromCollectionProps {

  collection?: CozyCollection;

  folderId?: string;

  open: boolean;

  onCancel(): void;

  onImported(): void;

}

type ParseResult = { id: string, parsed: CozyParseResult };

export const ImportFromCollection = (props: ImportFromCollectionProps) => {

  const store = useStore();

  const [selected, setSelected] = useState<CozyCollectionItem[]>([]);

  const [parsed, setParsed] = useState<ParseResult[]>([]);

  const [importing, setImporting] = useState(false);
  
  const [importError, setImportError] = useState<string | undefined>();

  const importProgress = useMemo(() => {
    if (!importing || selected.length === 0) return 0;
    return Math.round(100 * parsed.length / selected.length);
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
          return Cozy.parseURL(manifest.id).then(parsed => ({ id, parsed }));
        }
      });

    selected.reduce<Promise<ParseResult[]>>((promise, manifest) => promise.then(results => {
      return importOne(manifest).then(parsed => {
        const next = [...results, parsed];
        setParsed(next);
        return next;
      });
    }), Promise.resolve([])).then(results => {
      results.reduce<Promise<void>>((promise, { parsed, id }) => promise.then(() => {
        if (parsed.type === 'manifest') {
          const { resource } = parsed;

          const info: IIIFResourceInformation = {
            id,
            name: resource.getLabel() || `IIIF Presentation API v${resource.majorVersion}`,
            uri: resource.id,
            importedAt: new Date().toISOString(),
            type: 'PRESENTATION_MANIFEST',
            majorVersion: resource.majorVersion,
            canvases: resource.canvases.map(canvas => ({
              id: murmur.v3(canvas.id).toString(),
              uri: canvas.id,
              name: getCanvasLabelWithFallback(canvas),
              manifestId: id
            }))
          }

          return store.importIIIFResource(info, props.folderId).then(() => {});
        } else {
          // Should never happen
          console.error('Invalid parse result', parsed);
          throw new Error(`Invalid parse result`);
        }
      }), Promise.resolve(undefined)).then(() => {
        setImporting(false);
        props.onImported();
      }).catch(error => {
        console.error(error);

        setImporting(false);
        setImportError(error.message);
      });
    }).catch(error => {
      console.error(error);

      setImporting(false);
      setImportError(error.message);
    });
  }

  return (
    <>
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

      <ProgressDialog
        icon={<LibrarySquare className="h-5 w-5" />}
        open={importing}
        title="Importing"
        message={`Importing ${selected.length} IIIF manifests`}
        progress={importProgress} />
    </>  
  )

}