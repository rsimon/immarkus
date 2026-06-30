import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/Dialog';
import { IIIFManifestResource, IIIFResource, LoadedFileImage } from '@/model';
import { Label } from '@/ui/Label';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import { exportImageToIIIF } from '@/store/export/iiif/exportImageToIIIF';
import { useStore } from '@/store';
import { exportDerivativeResource } from '@/store/export/iiif/exportDerivativeResource';

interface IIIFExportDialogProps {

  item: LoadedFileImage | IIIFResource;

  open: boolean;

  onOpenChange(open: boolean): void;

}

const stripTrailingSlash = (value: string) =>
  value.replace(/\/+$/, '');

const isValidUrl = (value: string) => {
  if (!value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const IIIFExportDialog = (props: IIIFExportDialogProps) => {
  const [baseUrl, setBaseUrl] = useState('');
  const [touched, setTouched] = useState(false);

  const valid = isValidUrl(baseUrl);
  const showError = touched && baseUrl.length > 0 && !valid;

  const store = useStore();

  const onExport = () => {
    if (!store) return;

    if (!valid) {
      setTouched(true);
      return;
    }

    if ('data' in props.item)
      exportImageToIIIF(props.item, stripTrailingSlash(baseUrl), store);
    else 
      exportDerivativeResource(props.item as IIIFManifestResource, stripTrailingSlash(baseUrl), store);

    props.onOpenChange(false);
  }

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setBaseUrl('');
      setTouched(false);
    }
    props.onOpenChange(open);
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export as IIIF Resource</DialogTitle>
          <DialogDescription>
            This will generate a ZIP file containing the image, a IIIF Presentation
            v3 manifest, and an annotation list, ready to deploy as a static IIIF
            resource. Because the manifest and annotations reference each other by
            absolute URL, you need to provide the base URL where these files will
            be hosted once deployed.
          </DialogDescription>

          <div className="space-y-2">
            <Label htmlFor="iiif-base-url">Base URL</Label>

            <Input
              id="iiif-base-url"
              type="url"
              placeholder="https://example.org/iiif"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={showError} />

            {showError ? (
              <p className="text-sm text-destructive">
                Please enter a valid URL, including the protocol (e.g. https://).
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                The folder this ZIP is extracted into should be served at exactly
                this URL.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onExport} disabled={!valid}>
              Export ZIP
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )

}