import { useState } from 'react';
import { Annotorious, ImageAnnotation} from '@annotorious/react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { TranscriptionDialog } from './TranscriptionDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';


interface TranscribeProps {

  images: LoadedImage[];

}

export const Transcribe = (props: TranscribeProps) => {

  // Should never happen
  if (props.images.length < 1) return null;

  const [selectedImage, setSelectedImage] = useState<LoadedImage | undefined>(
    props.images.length === 1 ? props.images[0] : undefined
  );

  const manifold = useAnnotoriousManifold();

  const onImportAnnotations = (annotations: ImageAnnotation[], image: LoadedImage) => {
    const anno = manifold.getAnnotator(image.id);
    anno.state.store.bulkAddAnnotations(annotations, false);
  }

  return (
    <div className="px-4 pb-2">
      <div className="pt-6 pb-1 flex gap-3 items-start leading-relaxed">
        {props.images.length === 1 ? (
          <p className="font-medium">
            Submit this image to an OCR service for automatic
            transcription.
          </p>
        ) : (
          <p className="font-medium">
            Select an image to submit to an OCR service for automatic
            transcription.
          </p>
        )}
      </div>

      <Annotorious>
        {props.images.length > 1 && (
          <Select
            value={selectedImage?.id}
            onValueChange={id => setSelectedImage(props.images.find(i => i.id === id))}>
            <SelectTrigger className="mt-2 w-full bg-white whitespace-nowrap [&>*]:overflow-hidden [&>*]:text-ellipsis">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {props.images.map(image => (
                <SelectItem
                  key={image.id}  
                  value={image.id}
                  className="whitespace-nowrap overflow-hidden">
                  {image.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <TranscriptionDialog 
          disabled={!selectedImage}
          image={selectedImage} 
          onImport={annotations => onImportAnnotations(annotations, props.images[0])} />
      </Annotorious>
    </div>
  )

}