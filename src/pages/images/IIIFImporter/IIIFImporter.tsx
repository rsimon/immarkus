import { useEffect, useState } from 'react';
import murmur from 'murmurhash';
import { type CozyParseResult, Cozy, CozyCollection } from 'cozy-iiif';
import { Ban, Check, CloudDownload, Loader2, SquareLibrary } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';
import { IIIFResource, IIIFResourceInformation } from '@/model/IIIFResource';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { useStore } from '@/store';
import { generateShortId } from '@/store/utils';
import { getCanvasLabelWithFallback } from '@/utils/iiif';
import { ErrorAlert } from './ErrorAlert';
import { ImportFromCollection } from './ImportFromCollection';

interface IIIFImporterProps {

  folderId?: string;

}

export type ImportableIIIFResource = Omit<IIIFResource, 'path' | 'folder'>;

export const IIIFImporter = (props: IIIFImporterProps) => {

  const store = useStore();

  const [open, setOpen] = useState(false);

  const [uri, setURI] = useState('');

  const [showCollectionImporter, setShowCollectionImporter] = useState(false);

  const [alreadyImported, setAlreadyImported] = useState(false);

  const [busy, setBusy] = useState(false);

  const [parseResult, setParseResult] = useState<CozyParseResult | undefined>();

  useEffect(() => {
    if (!open) {
      setURI('');
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    setParseResult(undefined);
    setAlreadyImported(false);

    if (!uri) {
      setBusy(false);
      return;
    }

    // IMMARKUS can't currently import a manifest twice!
    generateShortId(uri).then(id => {
      // ID is derived from the URI–check if it already exists
      const existing = Boolean(store.getIIIFResource(id));
      if (existing) {
        setAlreadyImported(true);
      } else {
        setBusy(true);

        Cozy.parseURL(uri)
          .then(result => {
            setBusy(false);
            setParseResult(result);
          })
          .catch(error => {
            console.error(error);
            setBusy(false);
          });
      }
    });
  }, [uri]);

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!parseResult || parseResult.type === 'error') return;

    if (parseResult.type === 'manifest') {
      generateShortId(uri).then(id => {
        const { resource } = parseResult;

        const info: IIIFResourceInformation = {
          id,
          name: resource.getLabel() || `IIIF Presentation API v${resource.majorVersion}`,
          uri,
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

        store.importIIIFResource(info, props.folderId).then(() => {
          setOpen(false);
        });
      });
    } else {
      // Should never happen
      console.warn('Unsupported content type', parseResult);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal ring-offset-2 rounded">
          <CloudDownload className="size-[18px] pt-[1px]" /> Import IIIF
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogTitle>
          Import IIIF Manifest
        </DialogTitle>
        
        <DialogDescription asChild> 
          <div className="leading-relaxed space-y-1 mb-2">
            <p>
            Paste the URL to a <strong className="font-semibold">IIIF Presentation Manifest</strong>. The 
            following links will <strong className="font-semibold">not</strong> work:
            </p>

            <ul className="list-disc pl-5">
              <li>viewer pages – e.g. pages that embed Mirador or Universal Viewer.</li>
              <li>links to image files – <code className="text-xs">jpg</code>, <code className="text-xs">png</code>, etc.</li>
              <li>IIIF Image API endpoints – ending with <code className="text-xs">info.json</code>.</li>
            </ul>
          </div>
        </DialogDescription>

        <form 
          className="text-xs space-y-2"
          onSubmit={onSubmit}>
          <Input 
            autoFocus
            value={uri}
            placeholder="IIIF Presentation API URL"
            onChange={evt => setURI(evt.target.value)} />

          {busy ? (
            <div className="flex items-center gap-1.5 pl-0.5">
              <Loader2 className="animate-spin size-3.5 mb-[1px]" /> Fetching...
            </div>
          ) : alreadyImported ? (
            <div 
              className="p-3 mt-6 items-start leading-relaxed
                rounded text-destructive border border-destructive">
              <div className="font-semibold mb-2 flex gap-1.5">
                <Ban className="size-3.5 mt-[3px]" /> Already Imported
              </div>

              <div>
                This manifests already exists in your project. IMMARKUS is currently not 
                able to import the same manifest into a project more than once.
              </div>
            </div>
          ) : parseResult?.type === 'error' ? (
            <div 
              className="p-3 mt-6 items-start leading-relaxed
                rounded text-destructive border border-destructive">

              {parseResult.code === 'FETCH_ERROR' ? (
                <ErrorAlert message="Failed to fetch. Server may restrict access." />
              ) : parseResult.code === 'INVALID_HTTP_RESPONSE' ? (
                <ErrorAlert message={`Failed to fetch. ${parseResult.message}`} />
              ) : (
                <ErrorAlert message={parseResult.message} />
              )}
            </div>
          ) : parseResult?.type === 'iiif-image' ? (
            <div className="flex items-center gap-1.5 pl-0.5 text-red-600">
              <Ban className="size-3.5 mb-[1px]" /> Image API URLs are currently unsupported
            </div>
          ) : parseResult?.type === 'manifest' ? (
            <div className="flex items-center gap-1.5 pl-0.5 text-green-600">
              <Check className="size-4" /> {parseResult.resource.getLabel() || `Presentation API v${parseResult.resource.majorVersion}`}
            </div>
          ) : parseResult?.type === 'webpage' ? (
            <div 
              className="p-3 mt-6 items-start leading-relaxed
                rounded text-destructive border border-destructive">
              <ErrorAlert message="Invalid URL: web page" />
            </div>
          ) : parseResult?.type === 'collection' ? (
            <div className="flex items-center gap-1 pl-0.5">
              <SquareLibrary className="size-4.5 mb-0.5" /> 
              <div>
                This is a IIIF Collection Manifest with multiple items. 
                <Button 
                  variant="link"
                  className="px-1 text-xs"
                  onClick={() => setShowCollectionImporter(true)}>Choose items to import</Button> 
              </div>
            </div>
          ) : parseResult?.type === 'plain-image' ? (
            <div 
              className="p-3 mt-6 items-start leading-relaxed
                rounded text-destructive border border-destructive">
              <ErrorAlert message="Invalid URL: image file" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-0.5">{'\u00A0'}</div>
          )}

          <ImportFromCollection 
            open={showCollectionImporter}
            collection={(parseResult as any)?.resource as CozyCollection} 
            onCancel={() => setShowCollectionImporter(false)} />

          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button 
                type="button"
                variant="ghost">
                Cancel
              </Button>
            </DialogClose>

            <Button
              disabled={!parseResult || parseResult?.type !== 'manifest'}>
              Import
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

}