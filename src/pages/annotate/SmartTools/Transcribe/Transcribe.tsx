import { Annotorious, ImageAnnotation} from '@annotorious/react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { TranscriptionDialog } from './TranscriptionDialog';

interface TranscribeProps {

  images: LoadedImage[];

}

export const Transcribe = (props: TranscribeProps) => {

  if (props.images.length < 1) return null;

  const manifold = useAnnotoriousManifold();

  const onImportAnnotations = (annotations: ImageAnnotation[], image: LoadedImage) => {
    const anno = manifold.getAnnotator(image.id);
    anno.state.store.bulkAddAnnotations(annotations, false);
  }

  return (
    <div className="px-4 pb-1">
      <div className="pt-6 pb-1 flex gap-3 items-start">
        <p className="font-medium">
          Submit this image to on OCR service for automatic
          transcription.
        </p>
      </div>

      <Annotorious>
        <TranscriptionDialog 
          image={props.images[0]} 
          onImport={annotations => onImportAnnotations(annotations, props.images[0])} />
      </Annotorious>
    </div>
  )

}