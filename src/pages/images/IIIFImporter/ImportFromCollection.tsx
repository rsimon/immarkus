import { useMemo, useState } from 'react';
import murmur from 'murmurhash';
import { FileX, LibrarySquare } from 'lucide-react';
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
import { importAnnotations } from './importAnnotations';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogTitle
} from '@/ui/Dialog';
import { 
  AlertDialog, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader,
  AlertDialogTitle
} from '@/ui/AlertDialog';

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

    const importOne = (manifest: CozyCollectionItem) => {
      const idSeed = props.folderId ? `${props.folderId}/${manifest.id}` : manifest.id;
      return generateShortId(idSeed).then(id => {
        const exists = Boolean(store.getIIIFResource(id));
        if (exists) {
          return Promise.reject(new Error(`${manifest.getLabel()} already exists in the current subfolder. IMMARKUS allows multiple imports of the same manifest, but each one must be placed in a different subfolder. To continue, please remove this manifest from the list or choose a different subfolder.`));
        } else {
          return Cozy.parseURL(manifest.id).then(parsed => ({ id, parsed }));
        }
      });
    }

    selected.reduce<Promise<ParseResult[]>>((promise, manifest) => promise.then(results => {
      return importOne(manifest).then(parsed => {
        const next = [...results, parsed];
        setParsed(next);
        return next;
      });
    }), Promise.resolve([])).then(results => {
      const allValid = results.every(r => r.parsed.type === 'manifest');

      if (allValid) {
        results.reduce<Promise<void>>((promise, { parsed, id }) => promise.then(() => {
          // Just to make the TS compiler happy
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

            importAnnotations(id, resource.canvases)
              .then(annotations => store.importIIIFResource(info, props.folderId, annotations));
          }
        }), Promise.resolve(undefined)).then(() => {
          setImporting(false);
          props.onImported();
        }).catch(error => {
          console.error(error);

          setImporting(false);
          setImportError(error.message);
        });
      } else {
        console.error('Invalid parse result', results);
        throw new Error(`Invalid parse result`);
      }
    }).catch((error: Error) => {
      setImporting(false);
      setImportError(error.message);
    });
  }
  
  return (
    <>
      <Dialog 
        open={props.open}
        onOpenChange={open => !open && props.onCancel()}>
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

      <AlertDialog 
        open={Boolean(importError)}
        onOpenChange={open => !open && setImportError(undefined)}>

        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle
              className="flex gap-2 items-center text-destructive">
              <FileX className="size-5 -ml-0.5" />  Import Error
            </AlertDialogTitle>
            <AlertDialogDescription
              className="my-2 leading-relaxed text-primary">
              {importError}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-destructive border-destructive text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/90">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>  
  )

}