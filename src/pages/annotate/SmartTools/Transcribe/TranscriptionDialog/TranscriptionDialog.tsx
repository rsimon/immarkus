import { useEffect, useMemo, useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { TooltipProvider } from '@/ui/Tooltip';
import { LoadedImage } from '@/model';
import { PageTransform, Region, ServiceCrosswalk, ServiceRegistry, useService } from '@/services';
import { TranscriptionControls } from './TranscriptionControls';
import { TranscriptionPreview } from './TranscriptionPreview';
import { OCROptions, ProcessingState } from '../Types';
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

  transform: PageTransform;

  region?: Region;

  crosswalk: ServiceCrosswalk;

} 

interface TranscriptionDialogProps {

  disabled?: boolean;

  image: LoadedImage;

  onImport(annotations: ImageAnnotation[]): void;

}

export const TranscriptionDialog = (props: TranscriptionDialogProps) => {

  const [open, setOpen] = useState(false);

  const [region, setRegion] = useState<Region | undefined>();

  const [options, setOptions] = useState<OCROptions>({ serviceId: ServiceRegistry.listAvailableServices()[0].id });
  
  const service = useService(options.serviceId);

  const [processingState, setProcessingState] = useState<ProcessingState | undefined>();

  const [lastError, setLastError] = useState<string | undefined>();

  const [results, setResults] = useState<OCRResult[] | undefined>();

  const annotations = useMemo(() => {
    if ((results || []).length === 0) return; // No (successful) OCR run yet
    
    return results.reduce<ImageAnnotation[]>((all, result) => {
      const { data, transform, region, crosswalk } = result;
      const inThisBatch = crosswalk(data, transform, region, options.serviceOptions);
      return [...all, ...inThisBatch];
    }, []);
  }, [results, options]);

  useEffect(() => {
    if (!annotations) return;

    if (annotations.length > 0)
      setProcessingState('success')
    else 
      setProcessingState('success_empty');
  }, [annotations]);

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open) {
      setRegion(undefined);
      setProcessingState(undefined);
      setLastError(undefined);
      setResults(undefined);
    }
  }

  const onServiceChanged = (serviceId: string) => 
    setOptions(({ serviceId }));

  const onServiceOptionChanged = (key: string, value: string) =>
    setOptions(current => ({
      ...current,
      serviceOptions: {
        ...(current.serviceOptions || {}),
        [key]: value
      } 
    }));

  const onChangeRegion = (region: Region) => {
    setRegion(region);
    setProcessingState(undefined);
  }

  const onClearAnnotations = () => {
    setResults(undefined);
    setProcessingState(undefined);
  }

  const onImportAnnotations = () => {
    if (!annotations) return;
      
    props.onImport(annotations);
    setOpen(false);
  }

  const onSubmitImage = () => { 
    if (!service.connector) return;

    preprocess(props.image, region, setProcessingState).then(result => {
      setProcessingState('pending');

      const image = 'file' in result ? result.file : result.url;
      const crosswalk = service.connector.parseResponse;

      service.connector.submit(image, options.serviceOptions).then((data: any) => {
        // Test the crosswalk to make sure data is valid
        try {
          crosswalk(data, result.transform, region, options.serviceOptions);

          setResults(current => [...(current || []), { 
            data, 
            transform: result.transform,
            region,
            crosswalk
          }]);
        } catch (error) {
          setProcessingState('ocr_failed');
          setLastError(error.message)
        }
      }).catch((error: Error) => {
        setProcessingState('ocr_failed');
        setLastError(error.message);
      });   
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
          Select OCR Service
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
                lastError={lastError}
                options={options}
                processingState={processingState}
                region={region}
                onServiceChanged={onServiceChanged}
                onServiceOptionChanged={onServiceOptionChanged}
                onCancel={() => onOpenChange(false)}
                onSubmit={onSubmitImage} />
            </div>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  )

}