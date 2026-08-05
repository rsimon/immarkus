import { type SyntheticEvent, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource, IIIFResource, LoadedFileImage } from '@/model';
import { Alert, AlertDescription, AlertTitle } from '@/ui/Alert';
import { Label } from '@/ui/Label';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import { Checkbox } from '@/ui/Checkbox';
import { useStore } from '@/store';
import { exportImageToIIIF } from '@/store/export/iiif/exportImageToIIIF';
import { exportDerivativeResource } from '@/store/export/iiif/exportDerivativeResource';
import { exportImageFolderToIIIF } from '@/store/export/iiif/exportImageFolderToIIIF';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/ui/Dialog';

interface IIIFExportDialogProps {

  item: LoadedFileImage | IIIFResource | Folder;

  willSkipManifests: number;

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
  const [miradorSafe, setMiradorSafe] = useState(false);

  const valid = isValidUrl(baseUrl);
  const showError = touched && baseUrl.length > 0 && !valid;

  const store = useStore();

  const onExport = () => {
    if (!store) return;

    if (!valid) {
      setTouched(true);
      return;
    }

    const base = stripTrailingSlash(baseUrl);

    if ('data' in props.item) {
      exportImageToIIIF(props.item, base, miradorSafe, store);
    } else if ('handle' in props.item) {
      exportImageFolderToIIIF(props.item, base, miradorSafe, store);
    } else {
      exportDerivativeResource(props.item as IIIFManifestResource, base, miradorSafe, store);
    }

    props.onOpenChange(false);
  }

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setBaseUrl('');
      setTouched(false);
      setMiradorSafe(false);
    }
    props.onOpenChange(open);
  }

  const stopPropagation = (e: SyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }

  return (
    <Dialog 
      open={props.open} 
      onOpenChange={props.onOpenChange}>
      <DialogContent 
        className="max-w-2xl" 
        onClick={stopPropagation}>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <IIIFIcon color className="size-6 mb-0.5"/> {t('iiifExporter.exportToIIIF')}
          </DialogTitle>

          <DialogDescription className="leading-relaxed my-4">
            {t('iiifExporter.description')}
          </DialogDescription>

          {props.willSkipManifests > 0 && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-900 text-sm mb-4 -mx-0.5">
              <AlertTitle className="flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                <span className="font-medium">
                  {t('iiifExporter.skippingManifests', { count: props.willSkipManifests })}
                </span>
              </AlertTitle>

              <AlertDescription className="text-amber-900/70 pt-1.5 text-xs leading-relaxed">
                {t('iiifExporter.skippingManifestsDescription', { count: props.willSkipManifests })}
              </AlertDescription>
            </Alert>
          )}

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
              <p className="text-xs text-muted-foreground">
                {t('iiifExporter.hint')}
              </p>
            )}
          </div>

          <div className="mb-6 mt-2">
            <div className="flex gap-2 items-center">
              <Checkbox
                id="iiif-mirador-safe"
                checked={miradorSafe}
                onCheckedChange={checked => setMiradorSafe(checked as boolean)} />

              <Label htmlFor="iiif-mirador-safe">
                {t('iiifExporter.miradorSafe')}
              </Label>
            </div>

            <p className="text-xs mt-2 text-muted-foreground leading-relaxed">
              {t('iiifExporter.miradorSafeHint')}
            </p>
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