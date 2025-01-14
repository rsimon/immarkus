import { useEffect, useState } from 'react';
import murmur from 'murmurhash';
import { Ban, Check, CloudDownload, Loader2 } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';
import { IIIFResource, IIIFResourceInformation } from '@/model/IIIFResource';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { useStore } from '@/store';
import { generateShortId } from '@/store/utils';
import { getCanvasLabel } from '@/utils/iiif/lib/helpers';
import { IIIFParseResult, ParseError } from '@/utils/iiif/lib/Types';
import { useManifestParser } from './useManifestParser';

interface IIIFImporterProps {

  folderId?: string;

}

export type ImportableIIIFResource = Omit<IIIFResource, 'path' | 'folder'>;

export const IIIFImporter = (props: IIIFImporterProps) => {

  const store = useStore();

  const [open, setOpen] = useState(false);

  const [uri, setURI] = useState('');

  const [busy, setBusy] = useState(false);

  const [response, setResponse] = useState<{ result?: IIIFParseResult, error?: ParseError } | undefined>();

  const { parse } = useManifestParser();

  useEffect(() => {
    if (!open) {
      setURI('');
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    setResponse(undefined);

    if (!uri) {
      setBusy(false);
      return;
    }

    setBusy(true);

    parse(uri)
      .then((response: { result?: IIIFParseResult, error?: ParseError}) => {
        setBusy(false);
        setResponse(response);
      })
      .catch(error => {
        console.error(error);
        setBusy(false);
      });
  }, [uri]);

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    const result = response?.result;
    if (!result) return; // Should never happen

    generateShortId(uri).then(id => {
      const info: IIIFResourceInformation = {
        id,
        name: result.label || `IIIF Presentation API v${result.majorVersion}`,
        uri,
        importedAt: new Date().toISOString(),
        type: result.type,
        majorVersion: result.majorVersion,
        canvases: result.parsed.map(canvas => ({
          id: murmur.v3(canvas.id).toString(),
          uri: canvas.id,
          name: getCanvasLabel(canvas),
          manifestId: id
        }))
      }

      store.importIIIFResource(info, props.folderId).then(() => {
        setOpen(false);
      });
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
          ) : Boolean(response?.error) ? (
            <div className="flex items-center gap-1.5 pl-0.5 text-red-600">
              <Ban className="size-3.5 mb-[1px]" /> 
              {response.error.type === 'FETCH_ERROR' ? (
                <span>
                  Failed to fetch. Server may restrict access. <a className="underline" href="https://iiif.io/guides/guide_for_implementers/#other-considerations" target="_blank">Learn more</a>.
                </span>
              ) : (
                <span>{response.error.message}</span>
              )}
            </div>
          ) : response?.result?.type === 'IIIF_IMAGE' ? (
            <div className="flex items-center gap-1.5 pl-0.5 text-red-600">
              <Ban className="size-3.5 mb-[1px]" /> Image API URLs are currently unsupported
            </div>
          ) : response?.result?.type === 'PRESENTATION_MANIFEST' ? (
            <div className="flex items-center gap-1.5 pl-0.5 text-green-600">
              <Check className="size-4" /> {response.result.label || `Presentation API v${response.result.majorVersion}`}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-0.5">{'\u00A0'}</div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button 
                type="button"
                variant="ghost">
                Cancel
              </Button>
            </DialogClose>

            <Button
              disabled={!response?.result || Boolean(response.error)}>
              Import
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

}