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
import { Button } from '@/ui/Button';

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
    // formData.append('language', 'cht');
    // formData.append('language', 'eng');
    formData.append('language', 'fre');
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');

    if ('file' in props.image) {
      const { file, data } = props.image;
      // Local image
      // Step 1: get image dimensions before compression
      console.log('file image');
      getImageDimensions(data).then(originalDimensions => {
        const compressionOpts = {
          maxSizeMB: 0.98,
          useWebWorker: true
        };

        console.log('compressing');

        imageCompression(file, compressionOpts).then(compressed => {
          formData.append('file', compressed, props.image.name);
          
          console.log('done');

          getImageDimensions(compressed).then(compressedDimensions => {
            const kx = originalDimensions.width / compressedDimensions.width;
            const ky = originalDimensions.height / compressedDimensions.height;

            console.log('Posting file image');

            fetch('https://api.ocr.space/parse/image', {
              method: 'POST',
              body: formData
            }).then(res => res.json()).then(data => {
              console.log(data);
              const annotations = parseOCRSpaceResponse(data, kx, ky);
              anno.setAnnotations(annotations);
            }).catch(error => {
              console.error(error);
            })
          });
        }).catch(error => {
          console.error(error);
        })
      });
    } else {
      // IIIF Image
      const { canvas } = props.image;

      const url = canvas.getImageURL(1200);
      formData.append('url', url);

      // We need to resolve this image to be sure about it's dimensions
      fetch(url).then(res => res.blob()).then(blob => {
        getImageDimensions(blob).then(({ width, height }) => {
          const kx = canvas.width / width;
          const ky = canvas.height / height;

          fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
          }).then(res => res.json()).then(data => {
            console.log(data);
            const annotations = parseOCRSpaceResponse(data, kx, ky);
            anno.setAnnotations(annotations);
          }).catch(error => {
            console.error(error);
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
          <div className="flex-[2] min-w-0 rounded overflow-hidden bg-muted border">
            <TranscriptionPreview 
              image={props.image} />
          </div>

          <div className="flex-[1] min-w-0">
            <TranscriptionControls 
              onCancel={() => setOpen(false)}
              onSubmitImage={onSubmitImage} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}