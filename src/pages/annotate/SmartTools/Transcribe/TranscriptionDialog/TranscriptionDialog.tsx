import { useEffect, useMemo, useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { TooltipProvider } from '@/ui/Tooltip';
import { LoadedImage } from '@/model';
import { ServiceRegistry } from '@/services';
import { TranscriptionControls } from './TranscriptionControls';
import { TranscriptionPreview } from './TranscriptionPreview';
import { parseOCRSpaceResponse } from '../crosswalks';
import { PageTransform, ProcessingState, Region } from '../Types';
import { preprocess } from './preprocess';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogTrigger 
} from '@/ui/Dialog';

interface OCRResult {

  data: any;

  transform: PageTransform,

} 

interface TranscriptionDialogProps {

  disabled?: boolean;

  image: LoadedImage;

  onImport(annotations: ImageAnnotation[]): void;

}

export const TranscriptionDialog = (props: TranscriptionDialogProps) => {

  const [open, setOpen] = useState(false);

  const [region, setRegion] = useState<Region | undefined>();

  const [options, setOptions] = useState<Record<string, any>>({});

  const [processingState, setProcessingState] = useState<ProcessingState | undefined>();

  const [rawOCR, setRawOCR] = useState<OCRResult[] | undefined>();

  const annotations = useMemo(() => {
    if ((rawOCR || []).length === 0) return; // No (successful) OCR run yet

    return rawOCR.reduce<ImageAnnotation[]>((all, result) => {

      const inThisBatch = parseOCRSpaceResponse(result.data, result.transform, options.mergeLines);
      return [...all, ...inThisBatch];
    }, []);
  }, [rawOCR, options.mergeLines]);

  useEffect(() => {
    if (!annotations) return;

    if (annotations.length > 0)
      setProcessingState('success')
    else 
      setProcessingState('success_empty');
  }, [annotations]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open)
      setProcessingState(undefined);
  }

  const onChangeRegion = (region: Region) => {
    setRegion(region);
    setProcessingState(undefined);
  }

  const onClearAnnotations = () => {
    setRawOCR(undefined);
    setProcessingState(undefined);
  }

  const onImportAnnotations = () => {
    if (!annotations) return;
      
    props.onImport(annotations);
    setOpen(false);
  }

  const onSubmitImage = () => { 
    ServiceRegistry.getConnector('ocr-space').then(connector => {
      preprocess(props.image, region, setProcessingState).then(result => {
        setProcessingState('pending');

        const image = 'file' in result ? result.file : result.url;

        connector.submit(image, options).then((data: any) => {
          setRawOCR(current => [...(current || []), { data, transform: result.transform }]);
        }).catch((error: any) => {
          console.error(error);
          setProcessingState('ocr_failed');
        });   
      });
    }).catch(error => {
      console.error(error);
    });
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      <DialogTrigger asChild>
        <Button 
          disabled={props.disabled}
          className="bg-orange-400 hover:bg-orange-400/90 w-full h-9 mt-3">
          Configure
        </Button>
      </DialogTrigger>

      <DialogContent 
        closeIcon={false}
        className="rounded-lg w-11/12 h-11/12 max-w-11/12 p-3">
        <DialogTitle className="sr-only">
          Auto Transcribe
        </DialogTitle>

        <DialogDescription className="sr-only">
          Submit this image for automatic transcription.
        </DialogDescription>
        
        <div className="flex h-full gap-4">
          <TooltipProvider>
            <div className="flex-[2] min-w-0 rounded bg-muted border">
              <TranscriptionPreview 
                annotations={annotations}
                image={props.image} 
                processingState={processingState}
                onChangeRegion={onChangeRegion}
                onClearAnnotations={onClearAnnotations}
                onImportAnnotations={onImportAnnotations} />
            </div>

            <div className="flex-[1] min-w-0">
              <TranscriptionControls
                options={options}
                processingState={processingState}
                onOptionsChanged={setOptions}
                onCancel={() => onOpenChange(false)}
                onSubmit={onSubmitImage} />
            </div>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  )

}