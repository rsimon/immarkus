import { useEffect, useState } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { Image } from '@/model';
import { useImageMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { ImageMetadataForm, hasChanges } from '@/components/ImageMetadataForm';
import { PropertyValidation } from '@/components/PropertyFields';

interface ImageMetadataSectionProps {

  image: Image;

}

export const ImageMetadataSection = (props: ImageMetadataSectionProps) => {

  const { metadata, updateMetadata } = useImageMetadata(props.image?.id);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSave = () => updateMetadata(formState);

  return (
    <PropertyValidation>
      <div className="flex flex-col flex-grow justify-between w-full">
        <div>
          <ImageMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

        <Button 
          disabled={!hasChanges(metadata, formState)} 
          className="w-full mb-2"
          onClick={onSave}>
          Save Metadata
        </Button>
      </div>
    </PropertyValidation>
  )

}