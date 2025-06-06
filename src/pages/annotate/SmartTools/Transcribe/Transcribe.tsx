import { LoadedImage } from '@/model';
import { TranscriptionDialog } from './TranscriptionDialog';

interface TranscribeProps {

  images: LoadedImage[];

}

export const Transcribe = (props: TranscribeProps) => {

  if (props.images.length < 1) return null;

  return (
    <div className="px-4">
      <div className="pt-6 pb-1 flex gap-3 items-start">
        <p className="font-medium">
          Submit this image to on OCR service for automatic
          transcription.
        </p>
      </div>

      <TranscriptionDialog 
        image={props.images[0]} />
    </div>
  )

}