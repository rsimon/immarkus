import { useEffect, useState } from 'react';
import { CloudDownload } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';
import { IIIFResource, IIIFResourceInformation } from '@/model/IIIFResource';
import { Button } from '@/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { Input } from '@/ui/Input';
import { useManifestParser } from './useManifestParser';
import { useStore } from '@/store';

interface IIIFImporterProps {

  folderId?: string;

  onImport(resource: IIIFResource): void;

}

export type ImportableIIIFResource = Omit<IIIFResource, 'path' | 'folder'>;

export const IIIFImporter = (props: IIIFImporterProps) => {

  const store = useStore();

  const [open, setOpen] = useState(false);

  const [uri, setURI] = useState('');

  const [busy, setBusy] = useState(false);

  const { validate } = useManifestParser();

  useEffect(() => {
    if (!open) {
      setURI('');
      setBusy(false);
    }
  }, [open]);

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    setBusy(true);

    validate(uri).then(({ result, error }) => {
      setBusy(false);

      if (error || !result) {
        console.error('Error validating IIIF:' + uri);
        console.error(error);
      } else {
        if (result.type === 'PRESENTATION_MANIFEST') {
          const info: IIIFResourceInformation = {
            name: result.label || `IIIF Presentation API v${result.majorVersion}`,
            uri,
            importedAt: new Date().toISOString(),
            type: result.type,
            majorVersion: result.majorVersion
          }  

          store.importIIIFResource(info, props.folderId).then(resource => {
            setOpen(false);
            props.onImport(resource);
          });
        } else {
          console.log('Todo...')
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal">
          <CloudDownload className="size-5 pt-[1px]" /> Import IIIF
        </Button>
      </DialogTrigger>

      <DialogContent className="">
        <DialogTitle>
          Import IIIF
        </DialogTitle>
        
        <DialogDescription>
          Paste a IIIF Image URL
        </DialogDescription>

        <form 
          className="space-y-4"
          onSubmit={onSubmit}>
          <Input 
            autoFocus
            value={uri}
            onChange={evt => setURI(evt.target.value)} />

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button 
                type="button"
                variant="ghost">
                Cancel
              </Button>
            </DialogClose>

            <Button>Import</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

}