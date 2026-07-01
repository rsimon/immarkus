import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IIIFIcon } from '@/components/IIIFIcon';
import { IIIFManifestResource, IIIFResource, LoadedFileImage } from '@/model';
import { Label } from '@/ui/Label';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import { useStore } from '@/store';
import { exportImageToIIIF } from '@/store/export/iiif/exportImageToIIIF';
import { exportDerivativeResource } from '@/store/export/iiif/exportDerivativeResource';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/ui/Dialog';

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
  const { t } = useTranslation('images');

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
    <Dialog 
      open={props.open} 
      onOpenChange={props.onOpenChange}>
      <DialogContent 
        className="max-w-xl" 
        onClick={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <IIIFIcon color className="size-6 mb-0.5"/> {t('iiifExporter.exportToIIIF')}
          </DialogTitle>

          <DialogDescription className="leading-relaxed my-4">
            {t('iiifExporter.description')}
          </DialogDescription>

          <div className="mb-6">
            <Label htmlFor="iiif-base-url">
              {t('iiifExporter.baseUrl')}
            </Label>

            <div className="py-3">
              <Input
                id="iiif-base-url"
                className="-mx-0.5"
                type="url"
                placeholder="https://example.org/my-collection/"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={showError} />
            </div>

            {showError ? (
              <p className="text-sm text-destructive">
                {t('iiifExporter.validationError')}
              </p>
            ) : (
              <p className="text-xs font-lightd">
                {t('iiifExporter.hint')}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={onExport} disabled={!valid}>
              {t('iiifExporter.exportZip')}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )

}