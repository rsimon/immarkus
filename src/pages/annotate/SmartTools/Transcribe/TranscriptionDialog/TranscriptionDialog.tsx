import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { AnnotoriousOpenSeadragonAnnotator, ImageAnnotation, useAnnotator } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { LoadedImage } from '@/model';
import { ProcessingState } from '../ProcessingState';
import { TranscriptionControls } from './TranscriptionControls';
import { TranscriptionPreview } from './TranscriptionPreview';
import { parseOCRSpaceResponse } from '../crosswalks';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogTitle, 
  DialogTrigger 
} from '@/ui/Dialog';

const { VITE_OCR_SPACE_KEY } = import.meta.env;

const getImageDimensions = (blob: Blob) => createImageBitmap(blob)
  .then(bitmap => {
    const { width, height } = bitmap;
    bitmap.close(); 
    return { width, height }
  });

interface TranscriptionDialogProps {

  image: LoadedImage;

}

export const TranscriptionDialog = (props: TranscriptionDialogProps) => {

  const [open, setOpen] = useState(false);

  const [annotations, setAnnotations] = useState<ImageAnnotation[] | undefined>();

  const [processingState, setProcessingState] = useState<ProcessingState | undefined>();

  const onOpenChange = (open: boolean) => {
    setOpen(open);

    if (!open)
      setProcessingState(undefined);
  }

  const onSubmitImage = (language: string) => {    
    setAnnotations(undefined);

    const formData  = new FormData();
    formData.append('apikey', VITE_OCR_SPACE_KEY);
    formData.append('language', language);
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');

    if ('file' in props.image) {
      const { file, data } = props.image;

      // Local image
      getImageDimensions(data).then(originalDimensions => {
        const compressionOpts = {
          maxSizeMB: 0.98,
          useWebWorker: true
        };

        setProcessingState('compressing');

        imageCompression(file, compressionOpts).then(compressed => {
          formData.append('file', compressed, props.image.name);
          
          getImageDimensions(compressed).then(compressedDimensions => {
            const kx = originalDimensions.width / compressedDimensions.width;
            const ky = originalDimensions.height / compressedDimensions.height;

            setProcessingState('pending');

            fetch('https://api.ocr.space/parse/image', {
              method: 'POST',
              body: formData
            }).then(res => res.json()).then(data => {
              setProcessingState('success');

              const annotations = parseOCRSpaceResponse(data, kx, ky);
              setAnnotations(annotations);
            }).catch(error => {
              console.error(error);
              setProcessingState('ocr_failed');
            })
          });
        }).catch(error => {
          console.error(error);
          setProcessingState('compressing_failed');
        })
      });
    } else {
      // IIIF Image
      const { canvas } = props.image;

      const url = canvas.getImageURL(1200);
      formData.append('url', url);

      setProcessingState('fetching_iiif');

      // We need to resolve this image to be sure about it's dimensions
      fetch(url).then(res => res.blob()).then(blob => {
        getImageDimensions(blob).then(({ width, height }) => {
          const kx = canvas.width / width;
          const ky = canvas.height / height;

          setProcessingState('pending');

          fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
          }).then(res => res.json()).then(data => {
            setProcessingState('success');

            const annotations = parseOCRSpaceResponse(data, kx, ky);
            setAnnotations(annotations);
          }).catch(error => {
            console.error(error);
            setProcessingState('ocr_failed');
          })
        })
      });
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      <DialogTrigger asChild>
        <Button className="bg-orange-400 hover:bg-orange-400/90 w-full h-9 mt-3">
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
          <div className="flex-[2] min-w-0 rounded bg-muted border">
            <TranscriptionPreview 
              annotations={annotations}
              image={props.image} />
          </div>

          <div className="flex-[1] min-w-0">
            <TranscriptionControls
              processingState={processingState}
              onCancel={() => onOpenChange(false)}
              onSubmitImage={onSubmitImage} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}