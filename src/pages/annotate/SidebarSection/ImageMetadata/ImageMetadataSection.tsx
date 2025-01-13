import { FormEvent, useEffect, useState } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { CanvasInformation, Image } from '@/model';
import { useImageMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { ImageMetadataForm, hasChanges } from '@/components/MetadataForm';
import { PropertyValidation } from '@/components/PropertyFields';

interface ImageMetadataSectionProps {

  image: Image | CanvasInformation;

}

export const ImageMetadataSection = (props: ImageMetadataSectionProps) => {

  if ('uri' in props.image) return null;

  const { metadata, updateMetadata } = useImageMetadata(props.image?.id);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    updateMetadata(formState);
  }

  return (
    <PropertyValidation>
      <form 
        className="flex flex-col flex-grow justify-between w-full"
        onSubmit={onSubmit}>
        <div>
          <ImageMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

        <Button 
          disabled={!hasChanges(metadata, formState)} 
          className="w-full mb-2">
          Save Metadata
        </Button>
      </form>
    </PropertyValidation>
  )

}