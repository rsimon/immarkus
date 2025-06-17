import { useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { TooltipProvider } from '@/ui/Tooltip';
import { LoadedImage } from '@/model';
import { TranscriptionControls } from './TranscriptionControls';
import { TranscriptionPreview } from './TranscriptionPreview';
import { parseOCRSpaceResponse } from '../crosswalks';
import { ProcessingState, Region } from '../Types';
import { preprocess } from './preprocess';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogTrigger 
} from '@/ui/Dialog';

const { VITE_OCR_SPACE_KEY } = import.meta.env;

interface TranscriptionDialogProps {

  disabled?: boolean;

  image: LoadedImage;

  onImport(annotations: ImageAnnotation[]): void;

}

export const TranscriptionDialog = (props: TranscriptionDialogProps) => {

  const [open, setOpen] = useState(false);

  const [annotations, setAnnotations] = useState<ImageAnnotation[] | undefined>();

  const [processingState, setProcessingState] = useState<ProcessingState | undefined>();

  const [region, setRegion] = useState<Region | undefined>();

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
    setAnnotations(undefined);
    setProcessingState(undefined);
  }

  const onImportAnnotations = () => {
    if (!annotations) return;
      
    props.onImport(annotations);
    setOpen(false);
  }

  const onSubmitImage = (language: string) => {  
    const formData  = new FormData();
    formData.append('apikey', VITE_OCR_SPACE_KEY);
    formData.append('language', language);
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');

    preprocess(props.image, region, setProcessingState).then(result => {
      setProcessingState('pending');

      const submit = () => {
        fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body: formData
        }).then(res => res.json()).then(data => {              
          const annotations = parseOCRSpaceResponse(data, result.transform);
          setAnnotations(current => [...(current || []), ...annotations]);
          
          if (annotations.length > 0)
            setProcessingState('success')
          else 
            setProcessingState('success_empty');
        }).catch(error => {
          console.error(error);
          setProcessingState('ocr_failed');
        });
      }

      if ('file'in result) {
        // File image or snippet
        formData.append('file', result.file, props.image.name);
        submit();
      } else {
        // IIIF image or region snippet
        formData.append('url', result.url);
        submit();
      }
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
                processingState={processingState}
                onCancel={() => onOpenChange(false)}
                onSubmitImage={onSubmitImage} />
            </div>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  )

}