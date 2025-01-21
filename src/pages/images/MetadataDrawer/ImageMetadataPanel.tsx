import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImageMetadata } from '@/store';
import { PropertyValidation } from '@/components/PropertyFields';
import { Button } from '@/ui/Button';
import { PanelTop } from 'lucide-react';
import { W3CAnnotationBody } from '@annotorious/react';
import { ImageMetadataForm, hasChanges } from '@/components/MetadataForm';
import { Image } from '@/model';

interface ImageMetadataPanelProps {

  image: Image;

}

export const ImageMetadataPanel = (props: ImageMetadataPanelProps) => {

  const navigate = useNavigate();

  const { metadata, updateMetadata } = useImageMetadata(props.image?.id);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    updateMetadata(formState);
  }

  const onOpen = () => navigate(`/annotate/${props.image.id}`);

  return (
    <PropertyValidation>
      <form 
        className="flex flex-col justify-between h-full py-3 px-4"
        onSubmit={onSubmit}>
        <div className="flex flex-col flex-grow">
          <h2 className="leading-relaxed mr-5 mb-8 font-medium">
            {props.image.name}
          </h2>
          
          <ImageMetadataForm
            metadata={formState}
            onChange={setFormState} />
        </div>

        <div className="pt-2 pb-4">        
          <Button 
            disabled={!hasChanges(metadata, formState)} 
            className="w-full mb-2"
            type="submit">
            Save
          </Button>

          <Button 
            variant="outline"
            className="w-full"
            type="button"
            onClick={onOpen}>
            <PanelTop className="h-4 w-4 mr-2" /> Open Image
          </Button>
        </div>
      </form>
    </PropertyValidation>
  )

}