import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { AnnotoriousOpenSeadragonAnnotator, useAnnotator } from '@annotorious/react';
import { LoadedImage } from '@/model';
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

    const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const onOpenChange = (open: boolean) => {
    // TODO
    setOpen(open);
  }

  const onSubmitImage = () => {    
    if (!anno) return;

    const formData  = new FormData();
    formData.append('apikey', VITE_OCR_SPACE_KEY);
    formData.append('language', 'cht');
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');

    if ('file' in props.image) {
      const { file, data } = props.image;
      // Local image
      // Step 1: get image dimensions before compression
      getImageDimensions(data).then(originalDimensions => {
        const compressionOpts = {
          maxSizeMB: 1,
          useWebWorker: true
        };

        imageCompression(file, compressionOpts).then(compressed => {
          formData.append('file', compressed, props.image.name);
          getImageDimensions(compressed).then(compressedDimensions => {
            const kx = originalDimensions.width / compressedDimensions.width;
            const ky = originalDimensions.height / compressedDimensions.height;

            fetch('https://api.ocr.space/parse/image', {
              method: 'POST',
              body: formData
            }).then(res => res.json()).then(data => {
              const annotations = parseOCRSpaceResponse(data, ky, ky);
              anno.setAnnotations(annotations);
            });
          });
        });
      });
    } else {
      console.error('Unsupported image', props.image);
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}>

      <DialogTrigger>
        Go!
      </DialogTrigger>

      <DialogContent 
        className="rounded-lg w-11/12 h-11/12 max-w-11/12 p-2">
        <DialogTitle className="sr-only">
          Auto Transcribe
        </DialogTitle>

        <DialogDescription className="sr-only">
          Submit this image for automatic transcription.
        </DialogDescription>
        
        <div className="flex h-full gap-4">
          <div className="flex-[2] min-w-0 rounded-l overflow-hidden bg-muted border">
            <TranscriptionPreview 
              image={props.image} />
          </div>

          <div className="flex-[1] min-w-0">
            <TranscriptionControls 
              onSubmitImage={onSubmitImage} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}