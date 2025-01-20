import { FormEvent, useEffect, useState } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { hasChanges, ImageMetadataForm } from '@/components/MetadataForm';
import { PropertyValidation } from '@/components/PropertyFields';
import { Image } from '@/model';
import { useImageMetadata } from '@/store';
import { Button } from '@/ui/Button';

interface MetadataProps {

  imageId: string;

}

export const Metadata = (props: MetadataProps) => {

  const { metadata, updateMetadata } = useImageMetadata(props.imageId);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    updateMetadata(formState);
  }

  return props.imageId.startsWith('iiif:') ? null : (
    <PropertyValidation>
      <form 
        className="bg-white border rounded shadow-sm min-h-48 flex flex-col justify-between p-3 pt-5 pb-2"
        onSubmit={onSubmit}>
        <div className="flex flex-col flex-grow">          
          <ImageMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

        <div className="pt-2">        
          <Button 
            disabled={!hasChanges(metadata, formState)} 
            className="w-full mb-2"
            type="submit">
            Save
          </Button>
        </div>
      </form>
    </PropertyValidation>
  )

}