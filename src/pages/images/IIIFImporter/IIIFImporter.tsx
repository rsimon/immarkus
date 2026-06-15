import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import murmur from 'murmurhash';
import { type CozyParseResult, Cozy } from 'cozy-iiif';
import { Ban, Check, CloudDownload, Loader2, MessageSquareX, MessagesSquare, SquareLibrary } from 'lucide-react';
import { DialogClose } from '@radix-ui/react-dialog';
import { Spinner } from '@/components/Spinner';
import { IIIFResource, IIIFResourceInformation } from '@/model/IIIFResource';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/ui/Dialog';
import { useStore } from '@/store';
import { generateShortId } from '@/store/utils';
import { getCanvasLabelWithFallback } from '@/utils/iiif';
import { ErrorAlert } from './ErrorAlert';
import { ImportFromCollection } from './ImportFromCollection';
import { AnnotationValidationResult, importAnnotations, validateAnnotations } from './importAnnotations';

interface IIIFImporterProps {

  folderId?: string;

}

export type ImportableIIIFResource = Omit<IIIFResource, 'path' | 'folder'>;

export const IIIFImporter = (props: IIIFImporterProps) => {

  const { t } = useTranslation('images');

  const store = useStore();

  const [open, setOpen] = useState(false);

  const [uri, setURI] = useState('');

  const [showCollectionImporter, setShowCollectionImporter] = useState(false);

  const [alreadyImported, setAlreadyImported] = useState(false);

  const [busy, setBusy] = useState(false);

  const [parseResult, setParseResult] = useState<CozyParseResult | undefined>();

  const [validatingAnnotations, setValidatingAnnotations] = useState(false);

  const [validatingSlow, setValidatingSlow] = useState(false);

  const [validationResult, setValidationResult] = useState<AnnotationValidationResult |  undefined>();

  useEffect(() => {
    if (!open) {
      setURI('');
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    setParseResult(undefined);
    setValidatingAnnotations(false)
    setValidationResult(undefined);
    setAlreadyImported(false);

    if (!uri) {
      setBusy(false);
      return;
    }

    // IMMARKUS will only allow the same manifest once per folder!
    const idSeed = props.folderId ? `${props.folderId}/${uri}` : uri;

    generateShortId(idSeed).then(id => {
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
  }, [props.folderId, uri]);

  useEffect(() => {
    if (parseResult?.type !== 'manifest') return;

    setValidatingAnnotations(true);
    setValidatingSlow(false);

    const onValidationSlow = () => setValidatingSlow(true);
    
    validateAnnotations(parseResult.resource.canvases, onValidationSlow)
      .then(setValidationResult);
  }, [parseResult]);

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!parseResult || parseResult.type === 'error') return;

    if (parseResult.type === 'manifest') {
      const idSeed = props.folderId ? `${props.folderId}/${uri}` : uri;

      generateShortId(idSeed).then(id => {
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

        importAnnotations(id, resource.canvases)
          .then(annotations => store.importIIIFResource(info, props.folderId, annotations))
          .then(() => setOpen(false));
      });
    } else {
      // Should never happen
      console.warn('Unsupported content type', parseResult);
    }
  }

  const onBulkImportComplete = () => {
    setShowCollectionImporter(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal ring-offset-2 rounded">
          <CloudDownload className="size-4.5 pt-px" /> {t('iiifImporter.importIIIF')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogTitle>
          {t('iiifImporter.title')}
        </DialogTitle>

        <DialogDescription asChild>
          <div className="leading-relaxed space-y-1 mb-2">
            <p>
              <Trans
                ns="images"
                i18nKey="iiifImporter.description"
                components={{
                  strong1: <strong className="font-semibold" />,
                  strong2: <strong className="font-semibold" />
                }} />
            </p>

            <ul className="list-disc pl-5">
              <li>{t('iiifImporter.linkTypeViewerPages')}</li>
              <li>
                <Trans
                  ns="images"
                  i18nKey="iiifImporter.linkTypeImageFiles"
                  components={{
                    code1: <code className="text-xs" />,
                    code2: <code className="text-xs" />
                  }} />
              </li>
              <li>
                <Trans
                  ns="images"
                  i18nKey="iiifImporter.linkTypeImageApi"
                  components={{
                    code1: <code className="text-xs" />
                  }} />
              </li>
            </ul>
          </div>
        </DialogDescription>

        <form
          className="text-xs space-y-2"
          onSubmit={onSubmit}>
          <Input
            autoFocus
            value={uri}
            placeholder={t('iiifImporter.urlPlaceholder')}
            onChange={evt => setURI(evt.target.value)} />

          {busy ? (
            <div className="flex items-center gap-1.5 pl-0.5">
              <Loader2 className="animate-spin size-3.5 mb-px" /> {t('iiifImporter.fetching')}
            </div>
          ) : alreadyImported ? (
            <div
              className="p-3 mt-6 items-start leading-relaxed
                rounded text-destructive border border-destructive">
              <div className="font-semibold mb-2 flex gap-1.5">
                <Ban className="size-3.5 mt-0.75" /> {t('iiifImporter.alreadyImportedTitle')}
              </div>

              <div>
                {t('iiifImporter.alreadyImportedMessage')}
              </div>
            </div>
          ) : parseResult?.type === 'error' ? (
            <div
              className="p-3 mt-6 items-start leading-relaxed
                rounded text-destructive border border-destructive">

              {parseResult.code === 'FETCH_ERROR' ? (
                <ErrorAlert message={t('iiifImporter.errors.fetchFailed')} />
              ) : parseResult.code === 'INVALID_HTTP_RESPONSE' ? (
                <ErrorAlert message={t('iiifImporter.errors.fetchFailedWithMessage', { message: parseResult.message })} />
              ) : (
                <ErrorAlert message={parseResult.message} />
              )}
            </div>
          ) : parseResult?.type === 'iiif-image' ? (
            <div className="flex items-center gap-1.5 pl-0.5 text-red-600">
              <Ban className="size-3.5 mb-px" /> {t('iiifImporter.errors.imageApiUnsupported')}
            </div>
          ) : parseResult?.type === 'manifest' ? (
            <>
              <div className="flex items-center gap-1.5 pl-0.5 text-green-600">
                <Check className="size-4" /> {parseResult.resource.getLabel() || t('iiifImporter.presentationApiFallback', { version: parseResult.resource.majorVersion })}
              </div>

              {validationResult && validationResult.total > 0 ? (
                <>
                  {validationResult.shapeAnnotations > 0 && (
                    <div className="flex items-center gap-1.5 pl-0.5 text-green-600">
                      <MessagesSquare className="size-4" />
                      {t('iiifImporter.annotationCount', { count: validationResult.shapeAnnotations })}
                    </div>
                  )}

                  {validationResult.canvasAnnotations > 0 && (
                    <div className="flex items-center gap-1.5 pl-0.5 text-green-600">
                      <MessagesSquare className="size-4" />
                      {t('iiifImporter.canvasAnnotationCount', { count: validationResult.canvasAnnotations })}
                    </div>
                  )}

                  {validationResult.failed > 0 && (
                    <div className="flex items-center gap-1.5 pl-0.5 text-red-600">
                      <MessageSquareX className="size-4" />
                      {t('iiifImporter.failedAnnotationCount', { count: validationResult.failed })}
                    </div>
                  )}
                </>
              ) :validationResult ? (
                  <div className="flex items-center gap-1.5 pl-0.5 text-gray-600">
                    <MessagesSquare className="size-4" />
                    {t('iiifImporter.noAnnotations')}
                  </div>
              ) : validatingAnnotations && (
                <div className="flex items-center gap-1.5 pl-0.5 text-gray-600">
                  <Spinner className="size-4" />
                  {t('iiifImporter.resolvingAnnotations')} {validatingSlow && (<span>{t('iiifImporter.mayTakeAWhile')}</span>)}
                </div>
              )}
            </>
          ) : parseResult?.type === 'webpage' ? (
            <div
              className="p-3 mt-6 items-start leading-relaxed
                rounded text-destructive border border-destructive">
              <ErrorAlert message={t('iiifImporter.errors.invalidUrlWebPage')} />
            </div>
          ) : parseResult?.type === 'collection' ? (
            <div className="flex items-center gap-1 pl-0.5 mt-1 text-amber-600">
              <SquareLibrary className="size-4.5 mb-0.5" />
              <div>
                <Trans
                  ns="images"
                  i18nKey="iiifImporter.collectionDetected"
                  components={{
                    selectButton: (
                      <Button
                        variant="link"
                        className="ml-1 p-0 h-auto text-xs text-amber-600 underline"
                        onClick={() => setShowCollectionImporter(true)} />
                    )
                  }} />
              </div>
            </div>
          ) : parseResult?.type === 'plain-image' ? (
            <div
              className="p-3 mt-6 items-start leading-relaxed
                rounded text-destructive border border-destructive">
              <ErrorAlert message={t('iiifImporter.errors.invalidUrlImageFile')} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-0.5">{'\u00A0'}</div>
          )}

          <ImportFromCollection 
            collection={parseResult?.type === 'collection' ? parseResult.resource : undefined} 
            folderId={props.folderId}
            open={showCollectionImporter}
            onCancel={() => setShowCollectionImporter(false)} 
            onImported={onBulkImportComplete} />

          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost">
                {t('common.cancel')}
              </Button>
            </DialogClose>

            <Button
              disabled={!parseResult || parseResult?.type !== 'manifest'}>
              {t('iiifImporter.import')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )

}