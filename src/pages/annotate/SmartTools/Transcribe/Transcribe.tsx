import { useState } from 'react';
import { Annotorious, ImageAnnotation, Origin, serializeW3CImageAnnotation} from '@annotorious/react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { useStore } from '@/store';
import { TranscriptionDialog } from './TranscriptionDialog';
import { AnnotationBatch } from './Types';
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

  const store = useStore();

  // Should never happen
  if (props.images.length < 1) return null;

  const [selectedImage, setSelectedImage] = useState<LoadedImage | undefined>(
    props.images.length === 1 ? props.images[0] : undefined
  );

  const manifold = useAnnotoriousManifold();

  const onImportAnnotations = (batches: AnnotationBatch[], image: LoadedImage) => {
    if (!store) return; // Should never happen

    const annotations = batches.reduce<ImageAnnotation[]>((all, batch) => 
      ([...all, ...batch.annotations.map(a => ({
        ...a,
        bodies: a.bodies.map(b => ({
          ...b,
          creator: {
            type: batch.generator.type || 'Software',
            ...batch.generator
          },
          created: new Date()
        })),
      }))]), []);

    // Add image annotations (internal data model!) to the annotator as a 'Remote' action
    const anno = manifold.getAnnotator(image.id);
    anno.state.store.bulkAddAnnotations(annotations, false, Origin.REMOTE);

    // Crosswalk to W3C and write to store. (Note: we could add them to the annotator
    // with Origin.LOCAL. This would handle W3C crosswalk for us. But because the
    // outer W3C API has no bulk handling, we'd generate one file write access per 
    // annotation, which will lead to overwrites!
    const w3c = annotations.map(a => serializeW3CImageAnnotation(a, selectedImage.id));
    store.bulkUpsertAnnotation(image.id, w3c);
  }

  return (
    <div className="px-4 pb-2">
      <div className="pt-6 pb-1 px-0.5 flex gap-3 items-start leading-relaxed">
        {props.images.length === 1 ? (
            <p className="font-medium">
              Automatically transcribe this image, or parts of it.
            </p>
        ) : (
          <p className="font-medium">
            Select an image to transcribe automatically.
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
          onImport={annotations => onImportAnnotations(annotations, selectedImage)} />
      </Annotorious>
    </div>
  )

}