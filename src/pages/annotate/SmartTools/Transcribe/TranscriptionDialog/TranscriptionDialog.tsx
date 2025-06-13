import { useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { Button } from '@/ui/Button';
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
    setAnnotations(undefined);

    const formData  = new FormData();
    formData.append('apikey', VITE_OCR_SPACE_KEY);
    formData.append('language', language);
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');

    preprocess(props.image, region, setProcessingState).then(result => {
      setProcessingState('pending');

      if ('file'in result) {
        // File image or snippet
        formData.append('file', result.file, props.image.name);
          
        fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body: formData
        }).then(res => res.json()).then(data => {              
          const annotations = parseOCRSpaceResponse(data, result.transform);
          setAnnotations(annotations);
          
          if (annotations.length > 0)
            setProcessingState('success')
          else 
            setProcessingState('success_empty');
        }).catch(error => {
          console.error(error);
          setProcessingState('ocr_failed');
        });
      } else {
        // IIIF image or region snippet
        formData.append('url', result.url);

        fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body: formData
        }).then(res => res.json()).then(data => {              
          const annotations = parseOCRSpaceResponse(data, result.transform);
          setAnnotations(annotations);

          if (annotations.length > 0)
            setProcessingState('success')
          else 
            setProcessingState('success_empty');
        }).catch(error => {
          console.error(error);
          setProcessingState('ocr_failed');
        });
      }
    });



    /*
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
              const annotations = parseOCRSpaceResponse(data, kx, ky);
              setAnnotations(annotations);

              if (annotations.length > 0)
                setProcessingState('success')
              else 
                setProcessingState('success_empty');
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
      const image = props.image.canvas.images[0];

      // Should never happen
      if (!image) throw new Error('Canvas has no image');

      // Determine the actual full-resolution pixel size of the
      // first canvas image. Note that this can **differ** from 
      // canvas.width/canvas.height!
      image.getPixelSize().then(originalSize => {
        
        // Fetch a (possibly reduced-size) IIIF image for OCR
        const imageURL = image.getImageURL(1200);
        formData.append('url', imageURL);

        setProcessingState('fetching_iiif');
        
        // We need to resolve the reduced image to know it's dimensions
        fetch(imageURL).then(res => res.blob()).then(blob => {
          getImageDimensions(blob).then(({ width, height }) => {
            const kx = originalSize.width / width;
            const ky = originalSize.height / height;

            setProcessingState('pending');

            fetch('https://api.ocr.space/parse/image', {
              method: 'POST',
              body: formData
            }).then(res => res.json()).then(data => {
              const annotations = parseOCRSpaceResponse(data, kx, ky);
              setAnnotations(annotations);

              if (annotations.length > 0)
                setProcessingState('success');
              else 
                setProcessingState('success_empty');
            }).catch(error => {
              console.error(error);
              setProcessingState('ocr_failed');
            });
          })
        });
      });
    }
    */
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
          <div className="flex-[2] min-w-0 rounded bg-muted border">
            <TranscriptionPreview 
              annotations={annotations}
              image={props.image} 
              onChangeRegion={setRegion}
              onClearAnnotation={onClearAnnotations}
              onImportAnnotations={onImportAnnotations} />
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